package world.horosho.CarMeeter.DB.Models.COMMON;

import world.horosho.CarMeeter.DB.Models.POST.User;

public class OauthUser extends User {
    private final String token;

    public OauthUser(String email, String username, String ipAddress, String token) {
        super(email, username, ipAddress, token);
        this.token = token;
    }

    public String tokenID() {
        return token;
    }
}
