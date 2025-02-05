import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Configurar Socket.IO con CORS permitido para el frontend
const io = new Server(httpServer, {
  cors: {
    origin: ["https://mapaznk.onrender.com", "http://localhost:5173"],  // Añadir dominios permitidos
    methods: ["GET", "POST"],
  },
  path: '/socket.io',  // Especificar la ruta del socket.io
});

// Definir la estructura de un token
interface Token {
  id: string;
  x: number;
  y: number;
  image: string;
  name: string;
}
let tokens: Token[] = []; // Estado mutable para almacenar los tokens
let tokenIdCounter = 1; // Contador para generar token IDs únicos

// Manejo de conexiones de Socket.IO
io.on("connection", (socket) => {
  console.log(`🔌 Usuario conectado: ${socket.id}`);

  // Enviar los tokens actuales al nuevo cliente
  socket.emit("updateTokens", tokens);

  // Recibir mensaje y reenviarlo a todos los clientes
  socket.on("mensaje", (data) => {
    console.log("📩 Mensaje recibido:", data);
    io.emit("mensaje", data);
  });

  // Agregar nuevo token con validación y ID único
  socket.on("addToken", (newToken: Omit<Token, 'id'>) => {
    // Generar un ID único si no se ha proporcionado
    const newTokenWithId: Token = {
      ...newToken,
      id: String(tokenIdCounter++) // Generar un ID único y convertirlo en string
    };

    // Asegurarse de que no haya un token con el mismo ID
    if (!tokens.find((token) => token.id === newTokenWithId.id)) {
      tokens.push(newTokenWithId);
      io.emit("updateTokens", tokens);
    }
  });

  // Eliminar un token
  socket.on("removeToken", (tokenId) => {
    console.log("******Recibido tokenId para eliminar:", tokenId);
  
    // Eliminar el token de la lista de tokens
    const updatedTokens = tokens.filter((token) => token.id !== tokenId);
    
    console.log("Tokens después de eliminar:", updatedTokens);
  
    // Actualizar la lista de tokens
    tokens = updatedTokens;

    // Emitir la lista actualizada a todos los clientes
    io.emit("updateTokens", tokens);
  });

  // Mover token en tiempo real
  socket.on("moveToken", (updatedToken: Token) => {
    const tokenIndex = tokens.findIndex((token) => token.id === updatedToken.id);

    if (tokenIndex !== -1) {
      // Actualizar el token sin mutar directamente el array
      tokens[tokenIndex] = { ...tokens[tokenIndex], ...updatedToken };

      // Emitir solo el token actualizado a todos los clientes
      io.emit("moveToken", tokens[tokenIndex]);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Usuario desconectado: ${socket.id}`);
  });
});

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, 'dist')));

// Manejo de rutas en el frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Iniciar el servidor con puerto dinámico
const PORT = process.env.PORT || 10000;
httpServer.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});