export interface FriendsStruct {

    friendsAwaiting: AvailableUser[],

    friends: AvailableUser[]

}

export interface AvailableUser{
    id: number,
    username: string,
    registered: number,
    avatar?: string
}