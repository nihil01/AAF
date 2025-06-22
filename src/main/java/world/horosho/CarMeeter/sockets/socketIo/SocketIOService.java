package world.horosho.CarMeeter.sockets.socketIo;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Collection;

@Slf4j
@Service
@RequiredArgsConstructor
public class SocketIOService {

    private final UserPublicKeysRepository userKeysRepository;

    public Mono<String> registerUserPublicKey(long userId, String publicKey) {
        return userKeysRepository.findByUserId(userId)
            .hasElement().flatMap(aBoolean -> {
                if (aBoolean){
                    return deletePublicKey(userId).then(saveAndReturnUserKey(userId, publicKey));
                }else{
                    return saveAndReturnUserKey(userId, publicKey);
                }
            });
    }

    public Mono<String> fetchUserKey(long userId) {
        return userKeysRepository.findByUserId(userId).map(UserKeyProjection::getPublicKey);
    }

    //Public key CD
    public Mono<Boolean> deletePublicKey(long userId) {
        return userKeysRepository.deleteByUserId(userId)
            .thenReturn(true)
            .onErrorReturn(false);
    }

    public Mono<String> saveAndReturnUserKey(long userId, String publicKey) {
        return userKeysRepository.save(new UserKeys.UserKeysBuilder()
                .userId(userId)
                .publicKey(publicKey)
                .build()
        ).thenReturn(publicKey);
    }
}
