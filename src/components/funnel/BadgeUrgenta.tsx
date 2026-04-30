interface BadgeUrgentaProps {
  text: string;
}

export default function BadgeUrgenta({ text }: BadgeUrgentaProps) {
  return (
    <span className="bg-[rgba(184,150,90,0.1)] border border-[#B8965A] text-[#B8965A] text-sm px-4 py-2 rounded inline-block tracking-wide">
      {text}
    </span>
  );
}
