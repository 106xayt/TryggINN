import React, { useState } from 'react';

export default function TryggInnWelcome() {
  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Barnehagekode:", code);
  };

  return (
    <div className="screen">
      <div className="top">
        <div className="logo">T</div>

        <h1 className="title">
          Velkommen til
          <br />
          TryggINN
        </h1>
      </div>

      <div className="card">
        <h2 className="card-title">
          Registrer din
          <br />
          Barnehage
        </h2>

        <p className="card-text">
          Fyll ut barnehagekoden i feltet
          <br />
          under for å få tilgang
        </p>

        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            className="input"
            placeholder="Kode"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <button type="submit" className="btn">
            Registrer
          </button>
        </form>
      </div>
    </div>
  );
}
