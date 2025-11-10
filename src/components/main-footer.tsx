export default function MainFooter() {
  return (
    <footer className="bg-card border-t border-border/50">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} TresEtapas. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
