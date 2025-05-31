package world.horosho.CarMeeter.DB.Models.GET;

import world.horosho.CarMeeter.DB.Models.POST.UserProjection;

import java.util.List;

public record FriendsStruct(List<UserProjection> friendsAwaiting, List<Friend> friends) {
}
