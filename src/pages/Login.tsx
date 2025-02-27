
import { Heart } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { Link } from "react-router-dom"

export default function LoginPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium hover:text-primary transition-colors">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Heart className="h-4 w-4" />
            </div>
            Studio Anatomy
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=1600&auto=format&fit=crop"
          alt="Medical students studying anatomy"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.8]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-background/20"></div>
        <div className="absolute bottom-0 left-0 right-0 p-12">
          <div className="space-y-2 text-white">
            <p className="text-sm text-white/80">Testimonial</p>
            <p className="text-xl font-medium leading-snug">
              "Studio Anatomy has transformed how our medical students understand complex anatomical structures."
            </p>
            <p className="text-sm font-medium">Dr. Sarah Johnson, Harvard Medical School</p>
          </div>
        </div>
      </div>
    </div>
  )
}
