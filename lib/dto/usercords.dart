class UserCords {
  double latitude;
  double longitude;
  String type;
  String userId;

  UserCords({
    required this.latitude,
    required this.longitude,
    required this.type,
    required this.userId,
  });

  factory UserCords.fromJson(Map<String, dynamic> json) {
    return UserCords(
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      type: json['type'] ?? '',
      userId: json['userId'] ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'latitude': latitude,
    'longitude': longitude,
    'type': type,
    'userId': userId,
  };

  static UserCords empty() => UserCords(
    latitude: 0.0,
    longitude: 0.0,
    type: '',
    userId: '',
  );

  void setLatitude(double lat) => latitude = lat;
  void setLongitude(double lng) => longitude = lng;
  void setType(String t) => type = t;
  void setuserId(String uuid) => userId = uuid;
}
