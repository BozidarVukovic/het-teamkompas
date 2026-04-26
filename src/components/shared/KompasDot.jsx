import { PUB } from "../../styles/tokens";

export default function KompasDot({ size = 26 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: `conic-gradient(${PUB.groen} 0 25%,${PUB.blauw} 25% 50%,${PUB.oranje} 50% 75%,${PUB.paars} 75% 100%)`,
        boxShadow: "0 10px 30px rgba(0,0,0,.18)",
      }}
    />
  );
}