
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Brain, Bone, BookOpen, Activity, ChevronRight, FileSignature } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Index: FC = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/40 backdrop-blur-sm bg-background/95 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="font-medium text-lg tracking-tight">Studio Anatomy</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">Home</Link>
            <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</Link>
            <Link to="/document-signing" className="text-sm font-medium hover:text-primary transition-colors">Documents</Link>
            <Link to="/explore" className="text-sm font-medium hover:text-primary transition-colors">Explore</Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 md:py-28 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Human Anatomy
                <span className="block text-primary">Redefined</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Explore the human body in unprecedented detail. 
                Our interactive learning platform transforms how you understand anatomy.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="rounded-full">
                  <Link to="/dashboard">
                    Explore Dashboard
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full">
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {[
                {
                  icon: <Brain className="h-8 w-8" />,
                  title: "Neuroanatomy",
                  description: "Explore the brain's complex structures and neural pathways."
                },
                {
                  icon: <Heart className="h-8 w-8" />,
                  title: "Cardiovascular",
                  description: "Understand the heart and circulatory system in intricate detail."
                },
                {
                  icon: <FileSignature className="h-8 w-8" />,
                  title: "Document Signing",
                  description: "Sign and manage important documents securely with our platform."
                }
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="bg-card border border-border/50 rounded-xl p-6 hover:shadow-md transition-shadow"
                  variants={fadeInUp}
                >
                  <div className="bg-primary/5 p-3 rounded-full w-fit mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="bg-muted/30 py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              className="text-center mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                Advanced Learning Tools
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our platform combines detailed visuals with interactive learning experiences.
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {[
                {
                  icon: <BookOpen className="h-6 w-6" />,
                  title: "Comprehensive Library"
                },
                {
                  icon: <Activity className="h-6 w-6" />,
                  title: "Interactive Diagrams"
                },
                {
                  icon: <Brain className="h-6 w-6" />,
                  title: "3D Model Exploration"
                },
                {
                  icon: <Heart className="h-6 w-6" />,
                  title: "Clinical Correlations"
                }
              ].map((tool, index) => (
                <motion.div 
                  key={index}
                  className="text-center p-6"
                  variants={fadeInUp}
                >
                  <div className="bg-background rounded-full p-4 mx-auto w-fit mb-4 shadow-sm">
                    {tool.icon}
                  </div>
                  <h3 className="font-medium">{tool.title}</h3>
                </motion.div>
              ))}
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

export default Index;
