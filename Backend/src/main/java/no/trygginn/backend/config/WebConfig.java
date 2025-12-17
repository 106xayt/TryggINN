package no.trygginn.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web-konfigurasjon for applikasjonen.
 * Denne klassen brukes blant annet til å konfigurere CORS,
 * slik at frontend og backend kan kommunisere med hverandre.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Konfigurerer CORS-regler for hele applikasjonen.
     * Dette er nødvendig når frontend (f.eks. Vite/React)
     * kjører på en annen port enn backend.
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Gjelder alle endepunkter i API-et
                // Tillater forespørsler fra Vite sin dev-server
                .allowedOrigins(
                        "http://localhost:5173",
                        "http://localhost:5174"
                )
                // Tillatte HTTP-metoder
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                // Tillater alle HTTP-headere
                .allowedHeaders("*")
                // Cookies og credentials er ikke tillatt
                .allowCredentials(false);
    }
}
