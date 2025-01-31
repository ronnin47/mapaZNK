import React, { useState, useEffect} from 'react';
import { Button } from 'react-bootstrap';
import 'animate.css'; // Importar Animate.css

interface Token {
  id: string;
  x: number;
  y: number;
  image: string;
  name: string;
}

export const Mapa: React.FC = () => {

  /*const [tokens, setTokens] = useState<Token[]>([
    { id: '1', x: 50, y: 50, image: '/emperador.jpg', name: 'Emperador' },
    { id: '2', x: 150, y: 100, image: '/horus.jpg', name: 'Horus' },
    { id: '3', x: 250, y: 200, image: '/anubis.jpg', name: 'Anubis' },
  ]);
*/
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTokenImage, setNewTokenImage] = useState<string | null>(null);
  const [newTokenName, setNewTokenName] = useState('');


  const [animationKey, setAnimationKey] = useState<number>(0); // Estado para forzar la reanimación
  const [distance, setDistance] = useState<string| number | null>(null);  // Estado para almacenar la distancia

// Estado para controlar la animación
const [animateTrash, setAnimateTrash] = useState(false);


  const handleTokenClick = (id: string) => {
    setSelectedTokens((prev) => {
      if (prev.includes(id)) {
        return prev; // Si el token ya está seleccionado, no hacer nada
      }
      
      if (prev.length < 2) {
        return [...prev, id]; // Agregar solo si es diferente
      } else {
        return [id]; // Reiniciar la selección con el nuevo token
      }
    });
  };

  const getTokenById = (id: string) => tokens.find((token) => token.id === id);

  const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  };

  const pixelsPerMeter = 3.78;
  const distanceInMeters =
    selectedTokens.length === 2
      ? calculateDistance(
          getTokenById(selectedTokens[0])?.x! + 25,
          getTokenById(selectedTokens[0])?.y! + 25,
          getTokenById(selectedTokens[1])?.x! + 25,
          getTokenById(selectedTokens[1])?.y! + 25
        ) / pixelsPerMeter - 12
      : 0;

  const roundedDistance = Math.round(distanceInMeters);

  

  const handleAddToken = () => {
    if (newTokenImage && newTokenName) {
      const newToken: Token = {
        id: (tokens.length + 1).toString(),
        x: 100,
        y: 100,
        image: newTokenImage,
        name: newTokenName,
      };
      setTokens((prev) => [...prev, newToken]);
      setShowModal(false);
      setNewTokenImage(null);
      setNewTokenName('');
    } else {
      alert('Por favor, proporciona un nombre e imagen para el Token.');
    }
  };
  const [backgroundImage, setBackgroundImage] = useState('/mapa1.jpg'); // Estado para la imagen de fondo

  const handleChangeBackground = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newBackgroundImage = e.target?.result as string;
        setBackgroundImage(newBackgroundImage); // Actualiza el estado del fondo
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const [showMapModal, setShowMapModal] = useState(false);

  const [showGrid, setShowGrid] = useState(false); // Estado para la cuadrícula
  



 const clickMap = (event: React.MouseEvent<HTMLDivElement>) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;


 // Si hay dos tokens seleccionados, limpiar la selección
 if (selectedTokens.length === 2) {
  setSelectedTokens([]);
  setDistance(null); // Opcional: limpiar la distancia mostrada
  return; // Evita que el resto de la función se ejecute
}

  // Registrar la posición del marcador
  setMarkerPosition({ x, y });

  

  // Reiniciar la animación cambiando la clave del estado
  setAnimationKey(prevKey => prevKey + 1);

  // Hacer que el marcador desaparezca después de 3 segundos
  setTimeout(() => {
    setMarkerPosition(null); // El marcador desaparecerá después de 3 segundos
  }, 3000);

  if (selectedTokens.length === 1) {
    const selectedToken = getTokenById(selectedTokens[0]);

    if (selectedToken) {
      // Calculamos la distancia entre el token y el punto de clic en el mapa
      const distanceInPixels = calculateDistance(
        selectedToken.x + 25,  // Coordenada X del token (ajustada al centro de la imagen)
        selectedToken.y + 25,  // Coordenada Y del token (ajustada al centro de la imagen)
        x,  // Coordenada X del clic en el mapa
        y   // Coordenada Y del clic en el mapa
      );

      // Convertimos la distancia a metros y aplicamos el ajuste de -12
      const distanceInMeters = (distanceInPixels / pixelsPerMeter) - 12;

      const roundedDistance = Math.round(distanceInMeters);

      const distanciaFinal = roundedDistance < 0 ? 0 : roundedDistance;

      // Actualizamos el estado para mostrar la distancia en metros
      setDistance(`Distancia: ${distanciaFinal} mts`);
    }
  } else {
    console.log("Selecciona un token antes de hacer clic en el mapa.");
  }
};


  const [markerPosition, setMarkerPosition] = useState<{ x: number, y: number } | null>(null); // Estado para almacenar la posición del marcador
  useEffect(() => {
    if (markerPosition) {
      console.log('Marcador visible en:', markerPosition); // Verifica la posición del marcador
      const timer = setTimeout(() => {
        console.log('El marcador desaparecerá ahora');
        setMarkerPosition(null); // El marcador desaparecerá después de 3 segundos
      }, 3000);

      // Limpiamos el temporizador si el componente se desmonta o cambia el marcador
      return () => {
        console.log('Limpiando el temporizador');
        clearTimeout(timer);
      };
    }
  }, [markerPosition]);

  useEffect(() => {
    if (selectedTokens.length === 2) {
      const adjustedDistance = roundedDistance < 0 ? 0 : roundedDistance;
      setDistance(`Distancia: ${adjustedDistance} mts`);
    }
  }, [selectedTokens, roundedDistance]);



  const handleDropOnTrash = (event: React.DragEvent) => {
    event.preventDefault();
    const tokenId = event.dataTransfer.getData("tokenId");
  
    // Activar la animación
    setAnimateTrash(true);
  
    // Eliminar el token de la lista
    setTokens((prevTokens) => prevTokens.filter(token => token.id !== tokenId));
    
    // Si el token eliminado estaba seleccionado, quitarlo de la selección
    setSelectedTokens((prevSelected) => prevSelected.filter(id => id !== tokenId));
  
    // Restablecer la animación después de que termine (1 segundo es la duración de la animación)
    setTimeout(() => {
      setAnimateTrash(false); // Desactivar animación después de la duración
    }, 1000); // Duración de la animación en milisegundos
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
    >

<div
  className={`trash-bin ${animateTrash ? "animate__animated animate__rubberBand" : ""}`}
  style={{
    position: "absolute",
    bottom: "10px",
    right: "10px",
    width: "80px",
    height: "80px",
    zIndex: 20000,
    borderRadius: "10px",
  }}
  onDragOver={(e) => e.preventDefault()} // Permitir que el elemento sea arrastrado hacia la papelera
  onDrop={handleDropOnTrash} // Manejar el evento de soltar el token
>
  {/* SVG directamente como contenido del div */}
  <img
    src="/tacho.svg" // Ruta al archivo SVG
    alt="Tacho de Basura"
    style={{
      width: "60px", // Ajusta el tamaño
      height: "60px", // Ajusta el tamaño
     
    }}
  />
</div>

      <div
        onClick={(event)=>clickMap(event)}

        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 1,
        }}
      >

{distance && (
  <div
    style={{
      color: "yellow",
      position: "absolute",
      top: "10px",
      left: "10px",
      backgroundColor: "rgba(0, 0, 0, 0.5)",  // Fondo semi-transparente para que sea más visible
      padding: "5px",
      borderRadius: "5px",
      zIndex: 2000,
    }}
  >
    {distance}
  </div>
)}


{markerPosition && (
  <div
    className="marker"  // Aplicamos la clase CSS para la animación
    key={animationKey}
    style={{
      top: `${markerPosition.y - 10}px`, // Ajustamos la posición del marcador
      left: `${markerPosition.x - 10}px`, // Ajustamos la posición del marcador
    }}
  />
)}
      <Button
              variant="outline-success"
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',        
                cursor: 'pointer',
                zIndex: 3,
              }}
              onClick={() => setShowModal(true)}
            >
              Crear Token
            </Button>

            <Button
        variant="outline-info"
        style={{
          position: 'absolute',
          top: '60px', // Debajo del botón "Crear Token"
          right: '20px',
          cursor: 'pointer',
          zIndex: 3,
        }}
        onClick={() => setShowMapModal(true)} // Abre el modal del mapa
      >
        Cargar Mapa
      </Button>
      {/* Botón para activar/desactivar la cuadrícula */}
      <Button
              variant="outline-light"
              style={{
                position: 'absolute',
                top: '100px', // Debajo del botón "Crear Token"
                right: '20px',
                cursor: 'pointer',
                zIndex: 3,
              }}
              onClick={() => setShowGrid((prev) => !prev)}
            >
              {showGrid ? 'Desactivar' : 'Cuadricula'}
            </Button>


      {showMapModal && (
        <div
          onClick={() => setShowMapModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 4,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'black',
              padding: '20px',
              borderRadius: '10px',
              textAlign: 'center',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <p style={{fontSize:"2em", color:"aliceblue"}}>Seleccionar Mapa</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleChangeBackground} // Usar la función corregida
              style={{
                display: 'block',
                margin: '10px auto',
                padding: '10px',
                color:"black",
                backgroundColor:"red",
                border:"2px solid aliceblue",
                borderRadius:"5px"
              }}
            />
          </div>
        </div>
      )}


      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 1,
        }}
      >
        {showGrid && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.68) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
            `,
              backgroundSize: '36.67px 36.67px',
              pointerEvents: 'none', // Evita que interfiera con la interacción
              zIndex: 2,
            }}
          />
        )}
      </div>






            {showModal && (
        <div
          onClick={() => setShowModal(false)} // Cierra el modal al hacer clic fuera
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 4,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()} // Previene el cierre al hacer clic dentro del contenido
            style={{
              backgroundColor: ' rgba(0, 0, 0, 0.69)',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '2em',color:"aliceblue" }}>Crear Nuevo Token</p>
            <input
              type="text"
              placeholder="Nombre del Token"
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              style={{
                display: 'block',
                margin: '10px auto',
                padding: '10px',
                width: '80%',
                borderRadius: '5px',
                border: '1px solid #ccc',
              }}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setNewTokenImage(event.target?.result as string);
                  };
                  reader.readAsDataURL(e.target.files[0]);
                }
              }}
              style={{
                display: 'block',
                margin: '10px auto',
                padding: '10px',
                color:"black",
                backgroundColor:"red",
                border:"2px solid aliceblue",
                borderRadius:"5px"
              }}
            />
            {newTokenImage && (
              <img
                src={newTokenImage}
                alt="Preview"
                style={{
                  display: 'block',
                  margin: '10px auto',
                  maxWidth: '100px',
                  maxHeight: '100px',
                  borderRadius:"50%"
                }}
              />
            )}
            <Button variant="outline-warning" onClick={handleAddToken}>
              Crear
            </Button>
          </div>
        </div>
      )}

            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                zIndex: 2,
              }}
            >
      {selectedTokens.length === 2 && (
        <svg
          
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        >
          {/* Línea punteada */}
          <path
            d={`M ${getTokenById(selectedTokens[0])?.x! + 25} ${getTokenById(selectedTokens[0])?.y! + 25} 
                L ${getTokenById(selectedTokens[1])?.x! + 25} ${getTokenById(selectedTokens[1])?.y! + 25}`}
            stroke="yellow"
            strokeWidth="3"
            fill="none"
            strokeDasharray="4, 4" /* Patrón de línea punteada */
            strokeLinecap="round"
          />

          {/* Recuadro y fondo oscuro */}
      
          <rect
            x={(getTokenById(selectedTokens[0])?.x! + getTokenById(selectedTokens[1])?.x!) / 2 + 25 - 35} /* Ajuste para centrar */
            y={(getTokenById(selectedTokens[0])?.y! + getTokenById(selectedTokens[1])?.y!) / 2 - 55} /* 2em arriba */
            width="70" /* Ancho del recuadro */
            height="30" /* Alto del recuadro */
            fill="rgba(0, 0, 0, 0.6)" /* Fondo oscuro */
            rx="5" /* Bordes redondeados */
            ry="5"
          
          />

          {/* Texto para la distancia */}
          <text
            x={(getTokenById(selectedTokens[0])?.x! + getTokenById(selectedTokens[1])?.x!) / 2 + 25}
            y={(getTokenById(selectedTokens[0])?.y! + getTokenById(selectedTokens[1])?.y!) / 2 - 40} /* Ajustado para que quede dentro del recuadro */
            fill="yellow"
            fontSize="20"
            fontFamily="fantasy"
            textAnchor="middle"
            alignmentBaseline="middle" /* Alinea el texto en el centro verticalmente */
          >
            {Math.max(roundedDistance, 0)} mts
          </text>
        </svg>
      )}
      {tokens.map((token) => (
  <div
    key={token.id}
    draggable={true}
    onDragStart={(e) => {
      e.dataTransfer.setData("tokenId", token.id); // Almacena el ID del token en dataTransfer
    }}
    onClick={() => handleTokenClick(token.id)}
    onDragEnd={(e) => {
      setTokens((prev) =>
        prev.map((t) =>
          t.id === token.id
            ? {
                ...t,
                x: e.clientX - 25, // Ajustar la posición del token cuando se termina el drag
                y: e.clientY - 25,
              }
            : t
        )
      );
    }}
    className='agrandar'
    style={{
      position: 'absolute',
      top: `${token.y}px`,
      left: `${token.x}px`,
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundImage: `url(${token.image})`,
      backgroundSize: 'cover',
      border: selectedTokens.includes(token.id)
        ? '2px solid red'
        : '2px solid black',
      cursor: 'pointer',
      pointerEvents: 'auto',
      zIndex: 2,
    }}
  >
    {/* Token Name */}
    <div
      style={{
        position: 'absolute',
        top: '50px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        backgroundColor: "rgba(30, 30, 30, 0.75)", 
        padding: '2px 5px',
        color: "yellow",
        borderRadius: '3px',
        fontSize: '12px',
        maxWidth: '100px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}
    >
      {token.name}
    </div>
  </div>
))}
            </div>


      </div>

     
    </div>
  );
};
