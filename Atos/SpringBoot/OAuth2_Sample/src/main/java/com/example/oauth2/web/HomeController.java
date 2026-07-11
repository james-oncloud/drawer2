package com.example.oauth2.web;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "index";
    }

    @GetMapping("/flow")
    public String flow() {
        return "flow";
    }

    @GetMapping("/dashboard")
    public String dashboard(
            @AuthenticationPrincipal OidcUser oidcUser,
            @RegisteredOAuth2AuthorizedClient("demo-client") OAuth2AuthorizedClient authorizedClient,
            Model model) {

        model.addAttribute("username", oidcUser.getPreferredUsername());
        model.addAttribute("email", oidcUser.getEmail());
        model.addAttribute("subject", oidcUser.getSubject());
        model.addAttribute("scopes", oidcUser.getAuthorities());

        if (authorizedClient != null) {
            model.addAttribute("accessToken", authorizedClient.getAccessToken().getTokenValue());
            model.addAttribute("tokenType", authorizedClient.getAccessToken().getTokenType().getValue());
            model.addAttribute("expiresAt", authorizedClient.getAccessToken().getExpiresAt());

            if (authorizedClient.getRefreshToken() != null) {
                model.addAttribute("refreshToken", authorizedClient.getRefreshToken().getTokenValue());
            }
        }

        return "dashboard";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }
}
