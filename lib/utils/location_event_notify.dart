class LocationNotifier{

  bool status;
  String message;

  LocationNotifier({required this.status,required this.message});

  factory LocationNotifier.fromJson(Map<String, dynamic> json) {
    return LocationNotifier(
      status: json['status'],
      message: json['message'],
    );
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['status'] = status;
    data['message'] = message;
    return data;
  }


  @override
  String toString() {
    return 'LocationNotifier{status: $status, message: $message}';
  }

}