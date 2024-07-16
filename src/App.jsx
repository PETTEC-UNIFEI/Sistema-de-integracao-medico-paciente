import React from 'react';
import './App.css';
import myImage from './images/medica_idosa.jpeg';

function App() {
  return (
    <div className="App">
      <button className="entrar_consulta">Entrar na consulta</button>
      <button className="agendar_consulta">Agendar consulta</button>
      <img src={myImage} alt="Descrição da imagem" className="medica_idosa" />
    </div>
  );
}

export default App;
