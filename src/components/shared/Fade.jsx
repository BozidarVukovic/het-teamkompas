import { useInView } from "./hooks";

export default function Fade({ children, delay = 0, style = {} }) {
  const [ref, vis] = useInView();

  return (
    <div
      ref={ref}
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(22px)",
        transition: `opacity .65s ${delay}s ease, transform .65s ${delay}s ease`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}