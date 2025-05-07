class Friend{

  final String username;
  final String friendship_uuid;
  final DateTime registered;

  Friend(this.username, this.friendship_uuid, this.registered);

  Friend.fromJson(Map<String, dynamic> json)
      : username = json['username'],
        friendship_uuid = json['friendship_uuid'],
        registered = DateTime.parse(json['registered']);

  Map<String, dynamic> toJson() => {
    'username': username,
    'friendship_uuid': friendship_uuid,
    'registered': registered.toIso8601String(),
  };


}