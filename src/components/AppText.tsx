import { Text, TextProps } from "react-native";

// Eğer TypeScript kullanıyorsan interface, kullanmıyorsan silebilirsin
interface AppTextProps extends TextProps {
  className?: string;
}

export function AppText({ className, style, ...props }: AppTextProps) {
  return (
    <Text
      // 1. font-sans: Nova Square fontunu uygular
      // 2. text-light-primary: Light modda siyah
      // 3. dark:text-dark-primary: Dark modda beyaz
      // 4. ${className}: Dışarıdan ekstra stil (boyut, renk vs.) gelirse onu da ekler
      className={`font-ozel text-secondary ${className}`}
      style={style}
      {...props}
    />
  );
}
