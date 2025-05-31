export interface FriendsStruct {

    friendsAwaiting: {
        username: string,
        registered: number
    }[],

    friends: {
        username: string,
        registered: number
    }[]

}

export interface AvailableUser{
    username: string,
    registered: number
}