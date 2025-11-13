package com.example.Backend.config;

import com.example.Backend.filter.JwtFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {
    public FilterRegistrationBean<JwtFilter> jwtFilter(JwtFilter jwtFilter) {
        FilterRegistrationBean<JwtFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(jwtFilter);
// Endpoint-urile protejate — ce vrei să treacă prin filtru
        registrationBean.addUrlPatterns("/api/doctor/*"
                ,
                "/api/patient/*");
//prioritatea filtrului (optional)
        registrationBean.setOrder(1);
        return registrationBean;
    }
}