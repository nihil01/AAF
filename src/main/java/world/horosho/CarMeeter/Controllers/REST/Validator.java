package world.horosho.CarMeeter.Controllers.REST;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
public class Validator {

    private final ObjectMapper objectMapper;

    // Внедряем ObjectMapper через конструктор
    public Validator(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @ExceptionHandler(WebExchangeBindException.class)
    public Mono<ResponseEntity<String>> handleValidationException(WebExchangeBindException ex, ServerWebExchange exchange) {
        // Основной объект для JSON
        Map<String, Object> response = new HashMap<>();
        response.put("host", exchange.getRequest().getURI().getHost());
        response.put("resource", exchange.getRequest().getURI().getPath());
        response.put("title", "Validation Errors");

        // Список ошибок валидации
        List<Map<String, String>> errors = ex.getFieldErrors().stream()
                .map(error -> {
                    Map<String, String> errorMap = new HashMap<>();
                    errorMap.put("class", error.getObjectName());
                    errorMap.put("field", error.getField());
                    errorMap.put("violationMessage", error.getDefaultMessage());
                    return errorMap;
                })
                .collect(Collectors.toList());

        response.put("errors", errors);

        // Преобразуем в JSON-строку с помощью Jackson
        String jsonResponse;
        try {
            jsonResponse = objectMapper.writeValueAsString(response);
        } catch (Exception e) {
            jsonResponse = "{\"error\": \"Failed to serialize validation errors\"}";
        }

        return Mono.just(ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .contentType(MediaType.APPLICATION_JSON)
                .body(jsonResponse));
    }
}