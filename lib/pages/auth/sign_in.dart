import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

import 'package:testapp/dto/user.dart';
import 'package:testapp/net/http_client.dart';
import 'package:testapp/pages/auth/sign_up.dart';
import 'package:testapp/pages/onboading.dart';
import 'package:testapp/utils/storage_data.dart';
import '../../utils/router.dart';

class OnBoardingPage extends StatelessWidget {
  const OnBoardingPage({Key? key}) : super(key: key);

  Future<String?> onBoarded() async {
    String? data = await getFromStorage("ONBOARDING_NEEDED");
    print("Onboarding data received => ${data ?? 'null'}");
    return data;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: FutureBuilder(
          future: onBoarded(),
          builder: (context, snapshot) {
            if(snapshot.connectionState == ConnectionState.waiting){
              return const Center(child: CircularProgressIndicator());
            }

            if(snapshot.data != null && snapshot.hasData) {
              return const SignInPage();
            }else{
              return const OnboardingPageFlow();
            }

          },
      ));
  }

}


class SignInPage extends StatefulWidget {
  const SignInPage({Key? key}) : super(key: key);

  @override
  State<SignInPage> createState() => _SignInPageState();
}


class _SignInPageState extends State<SignInPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool circular = false;

  Future<bool> _login() async{

    String email = _emailController.text;
    String password = _passwordController.text;

    if(email.isNotEmpty && password.isNotEmpty){

      bool result = await authenticate(
          User("login", "", email, password)
      );

      return result;

    }else{
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
        content: Text("Please fill all the fields"),
        backgroundColor: Colors.red,
      ));
      return false;
    }

  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body:
      Container(
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
              const SizedBox(height: 20), // Уменьшенный отступ сверху
              SvgPicture.asset(
                'assets/icons/car.svg',
                height: 60, // Ещё уменьшено
                color: Colors.white.withOpacity(0.9),
              ),
              const SizedBox(height: 10),
              const Text(
                "Sign In",
                style: TextStyle(
                  fontSize: 28, // Уменьшено
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
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    buttonItem(
                      Platform.isAndroid
                        ? Icons.android // Material Icon для Google
                        : Icons.apple, // Material Icon для Apple
                      Platform.isAndroid
                        ? 'Continue with Google'
                        : 'Continue with Apple',
                      20,
                      () {}
                    ),
                    const SizedBox(height: 14),
                    const Text(
                      'Or',
                      style: TextStyle(color: Colors.white, fontSize: 14),
                    ),
                    const SizedBox(height: 10),
                    textItem('Email', _emailController, false),
                    const SizedBox(height: 8),
                    textItem('Password', _passwordController, true),
                    const SizedBox(height: 10),
                    colorButton('Sign In'),
                  ],
                ),
              ),
              // Нижняя секция с текстом
              Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text(
                        "Don't have an Account?",
                        style: TextStyle(color: Colors.white, fontSize: 12),
                      ),
                      TextButton(
                        onPressed: () {
                          // Переход на страницу регистрации
                          Navigator.push(context,
                              MaterialPageRoute(builder: (context) => SignUpPage()));
                        },
                        child: const Text(
                          'Sign Up',
                          style: TextStyle(
                            color: Colors.redAccent,
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    //TODO DODELAT FORGOT PASS
                    onPressed: () {
                      // Логика восстановления пароля
                    },
                    child: const Text(
                      'Forgot Password?',
                      style: TextStyle(
                        color: Colors.white70,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  const SizedBox(height: 5), // Уменьшенный отступ снизу
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget buttonItem(IconData icon, String text, double size,
      VoidCallback onPressed) {

    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: size, color: Colors.white),
      label: Text(text, style: const TextStyle(color: Colors.white)),
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.grey[800],
        padding: const EdgeInsets.symmetric(horizontal: 50, vertical: 12),
      ),
    );
  }


  Widget textItem(
      String label, TextEditingController controller, bool obscureText) {
    return Container(
      width: MediaQuery.of(context).size.width - 90, // Уменьшено
      height: 45, // Уменьшено с 50
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        color: Colors.black.withOpacity(0.5),
      ),
      child: TextFormField(
        controller: controller,
        obscureText: obscureText,
        style: const TextStyle(color: Colors.white, fontSize: 14), // Уменьшено
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

  Widget colorButton(String name) {
    return InkWell(
      onTap: () {
        setState(() {
          circular = true;
        });

        _login().then((value) => {
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

      },
      child: Container(
        width: MediaQuery.of(context).size.width - 110, // Уменьшено
        height: 45, // Уменьшено с 50
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
              fontSize: 16, // Уменьшено
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}