"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body>
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
              Algo salio mal
            </h2>
            <button
              onClick={() => (typeof reset === "function" ? reset() : window.location.reload())}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#2563eb",
                color: "white",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
