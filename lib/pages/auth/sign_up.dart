import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:fluttertoast/fluttertoast.dart';
import 'package:testapp/dto/user.dart';
import 'package:testapp/net/http_client.dart';

import '../../utils/router.dart';

class SignUpPage extends StatefulWidget {
  const SignUpPage({Key? key}) : super(key: key);

  @override
  State<SignUpPage> createState() => _SignUpPageState();
}

// Move register function inside state class and make it async
class _SignUpPageState extends State<SignUpPage> {

Future<bool> _register() async {
    // Check for empty fields
    if(_nameController.text.trim().isEmpty ||
       _emailController.text.trim().isEmpty ||
       _passwordController.text.isEmpty ||
       _confirmPasswordController.text.isEmpty) {
      Fluttertoast.showToast(
          msg: "Please fill in all fields",
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.TOP,
          timeInSecForIosWeb: 1,
          backgroundColor: Colors.red,
          textColor: Colors.white,
          fontSize: 16
      );
      return false;
    }

    // Validate passwords match
    if(_passwordController.text != _confirmPasswordController.text) {
      Fluttertoast.showToast(
          msg: "Passwords do not match",
          toastLength: Toast.LENGTH_SHORT,
          gravity: ToastGravity.TOP,
          timeInSecForIosWeb: 1,
          backgroundColor: Colors.red,
          textColor: Colors.white,
          fontSize: 16
      );
      return false;
    }

    return await authenticate(
        User(
          "register",
          _nameController.text,
          _emailController.text,
          _passwordController.text,
        )
    );
  }
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  bool circular = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: MediaQuery.of(context).size.width,
        height: MediaQuery.of(context).size.height,
        decoration: BoxDecoration(
          image: const DecorationImage(
            image: AssetImage('lib/assets/sports_car.jpeg'),
            fit: BoxFit.cover,
            opacity: 0.3,
          ),
          gradient: const LinearGradient(
            colors: [
              Color(0xFF1A1A2E),
              Color(0xFF16213E),
              Color(0xFF0F3460),
            ],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const SizedBox(height: 5),
              SvgPicture.asset(
                'assets/icons/car.svg',
                height: 60,
                color: Colors.white.withOpacity(0.9),
              ),
              const SizedBox(height: 5),
              const Text(
                "Sign Up",
                style: TextStyle(
                  fontSize: 28,
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  shadows: [
                    Shadow(
                      blurRadius: 6.0,
                      color: Colors.redAccent,
                      offset: Offset(0, 0),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 5),
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const SizedBox(height: 8),
                    textItem('Name', _nameController, false),
                    const SizedBox(height: 8),
                    textItem('Email', _emailController, false),
                    const SizedBox(height: 8),
                    textItem('Password', _passwordController, true),
                    const SizedBox(height: 8),
                    textItem('Confirm Password', _confirmPasswordController, true),
                    const SizedBox(height: 15),
                    colorButton('Register', () async {
                      setState(() {
                        circular = true;
                      });

                      _register().then((value) => {
                        if(value){
                          setState(() {
                            circular = false;
                          }),

                          Navigator.pushReplacement(context,
                              MaterialPageRoute(builder: (context) => const MyHomePage()))

                        }else{
                          setState(() {
                            circular = false;
                          })
                        }
                      });

                      setState(() {
                        circular = false;
                      });
                    }),
                  ],
                ),
              ),
              Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        "Already have an Account?",
                        style: TextStyle(color: Colors.white, fontSize: 12),
                      ),
                      TextButton(
                        onPressed: () {
                          Navigator.pop(context);
                        },
                        child: const Text(
                          'Sign In',
                          style: TextStyle(
                            color: Colors.redAccent,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 5),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget buttonItem(
      IconData icon,
      String buttonName,
      double size,
      Function() onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: MediaQuery.of(context).size.width - 90,
        height: 45,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10),
          color: Colors.grey.shade900,
          border: Border.all(color: Colors.grey.shade700, width: 1),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: size,
              color: Colors.white70,
            ),
            const SizedBox(width: 5),
            Text(
              buttonName,
              style: const TextStyle(
                color: Colors.white70,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget textItem(
      String label, TextEditingController controller, bool obscureText) {
    return Container(
      width: MediaQuery.of(context).size.width - 90,
      height: 45,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        color: Colors.black.withOpacity(0.5),
      ),
      child: TextFormField(
        controller: controller,
        obscureText: obscureText,
        style: const TextStyle(color: Colors.white, fontSize: 14),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: const TextStyle(color: Colors.white70, fontSize: 14),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Colors.grey),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Colors.grey),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: Colors.redAccent, width: 1.5),
          ),
        ),
      ),
    );
  }

  Widget colorButton(String name, Function() onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        width: MediaQuery.of(context).size.width - 110,
        height: 45,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          color: Colors.grey.shade800,
          border: Border.all(color: Colors.grey.shade700, width: 1),
        ),
        child: Center(
          child: circular
              ? const CircularProgressIndicator(color: Colors.white)
              : Text(
            name,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}