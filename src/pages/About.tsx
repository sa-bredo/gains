
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Users, BookOpen, Lightbulb, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/95 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="font-medium text-lg tracking-tight">Studio Anatomy</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
            <Link to="/explore" className="text-sm font-medium hover:text-primary transition-colors">Explore</Link>
            <Link to="/about" className="text-sm font-medium text-primary transition-colors">About</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-6">About Studio Anatomy</h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Redefining how we understand and learn human anatomy through precision, clarity, and interactive experiences.
              </p>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 gap-16 items-center mb-24"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-muted-foreground mb-6">
                  Studio Anatomy was created with a singular purpose: to transform anatomical education through elegant design and intuitive interaction. We believe that understanding the human body should be accessible to everyone, not just medical professionals.
                </p>
                <p className="text-muted-foreground mb-6">
                  Our platform combines meticulous attention to detail with intuitive navigation to create learning experiences that are both beautiful and functional. Every element is designed with purpose, eliminating distractions and focusing on what matters most—your understanding.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild>
                    <Link to="/explore">
                      Explore Our Content
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <Card className="overflow-hidden border-none">
                <CardContent className="p-0">
                  <img 
                    src="https://images.unsplash.com/photo-1576086213369-97a306d36557?q=80&w=800&auto=format&fit=crop" 
                    alt="Medical students studying anatomy" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div 
              className="mb-24"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center">Our Core Principles</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: <Lightbulb className="h-8 w-8" />,
                    title: "Clarity & Precision",
                    description: "Every element is designed with purpose, eliminating distractions and focusing on anatomical accuracy."
                  },
                  {
                    icon: <BookOpen className="h-8 w-8" />,
                    title: "Educational Depth",
                    description: "We believe in providing comprehensive knowledge that balances detail with accessibility."
                  },
                  {
                    icon: <Users className="h-8 w-8" />,
                    title: "User-Centered Design",
                    description: "Our platform adapts to different learning styles, creating personalized educational journeys."
                  }
                ].map((principle, index) => (
                  <Card key={index} className="border border-border/50">
                    <CardContent className="pt-6">
                      <div className="bg-primary/10 p-3 rounded-full w-fit mb-4">
                        {principle.icon}
                      </div>
                      <h3 className="text-xl font-medium mb-2">{principle.title}</h3>
                      <p className="text-muted-foreground">{principle.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="grid md:grid-cols-2 gap-16 items-center"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
            >
              <Card className="overflow-hidden border-none order-2 md:order-1">
                <CardContent className="p-0">
                  <img 
                    src="https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=800&auto=format&fit=crop" 
                    alt="Modern medical education" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                </CardContent>
              </Card>
              <div className="order-1 md:order-2">
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Who Benefits</h2>
                <div className="space-y-4">
                  {[
                    "Medical & Nursing Students",
                    "Healthcare Professionals",
                    "Physiotherapists & Physical Trainers",
                    "Educators & Academic Institutions",
                    "Artists & Illustrators",
                    "Anyone Curious About Human Anatomy"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-primary/10 p-1 rounded-full mt-0.5">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <Button asChild variant="outline">
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Heart className="w-5 h-5 text-primary" />
              <span className="font-medium">Studio Anatomy</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Studio Anatomy. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;
