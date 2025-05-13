package world.horosho.CarMeeter.Services.mail;

public record MailRequest(
        String username,
        String email,
        String code,
        String ip,
        String theme
) {
}
