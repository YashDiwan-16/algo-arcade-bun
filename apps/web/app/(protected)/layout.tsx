// 1:app/(auth)/layout.tsx
import Auth from "@/components/algorand/Auth";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return <Auth>{children}</Auth>;
};

export default AuthLayout;
