import 'package:flutter/material.dart';
import 'package:testapp/dto/onboard.dart';
import 'package:testapp/utils/storage_data.dart';
import 'auth/sign_in.dart';

class OnboardingPageFlow extends StatefulWidget {
  const OnboardingPageFlow({super.key});

  @override
  State<OnboardingPageFlow> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPageFlow> {
  final List<Onboard> slides = Onboard.getOnboard();
  final PageController _controller = PageController();
  int currentIndex = 0;

  Widget buildDot(int index) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      height: 10,
      width: currentIndex == index ? 24 : 10,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        color: currentIndex == index ? Colors.green : Colors.grey,
        borderRadius: BorderRadius.circular(20),
      ),
    );
  }

  void finishOnboarding() async {
    await setToStorage("ONBOARDING_NEEDED", "false");
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => const SignInPage()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: PageView.builder(
                controller: _controller,
                itemCount: slides.length,
                onPageChanged: (index) => setState(() {
                  currentIndex = index;
                }),
                itemBuilder: (context, index) =>
                    OnboardingSlider(onboard: slides[index]),
              ),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(slides.length, buildDot),
            ),
            const SizedBox(height: 20),
            //proverka na last slide
            currentIndex == slides.length - 1
                ? Padding(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  onPressed: finishOnboarding,
                  child: const Text(
                    "Начать",
                    style: TextStyle(fontSize: 16),
                  ),
                ),
              ),
            )
                : TextButton(
              onPressed: () => _controller.nextPage(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.ease),
              child: const Text(
                "Далее",
                style: TextStyle(color: Colors.green, fontSize: 16),
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }
}

// Renamed from Slider to OnboardingSlider
  class OnboardingSlider extends StatelessWidget {
    final Onboard onboard;
    const OnboardingSlider({super.key, required this.onboard});

    @override
    Widget build(BuildContext context) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center, // Issue 6: Center content vertically
        children: [
          // Issue 7: Add error handling for image loading
          Image.asset(
            onboard.asset,
            errorBuilder: (context, error, stackTrace) =>
              Icon(Icons.error, size: 50),
          ),
          SizedBox(height: 20),
          Text(onboard.title, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800), textAlign: TextAlign.center),
          SizedBox(height: 12),
          Padding( // Issue 8: Add padding for description text
            padding: EdgeInsets.symmetric(horizontal: 20),
            child: Text(onboard.description, textAlign: TextAlign.center),
          ),
          SizedBox(height: 25),
        ],
      );
    }
  }