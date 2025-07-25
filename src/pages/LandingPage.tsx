import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Shield, Users, Clock, Star, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: <Heart className="w-8 h-8 text-u-recover-green" />,
      title: 'Compassionate Care',
      description: 'Connect with licensed mental health professionals who truly care about your wellbeing.',
    },
    {
      icon: <Shield className="w-8 h-8 text-u-recover-green" />,
      title: 'Safe & Secure',
      description: 'Your privacy is our priority. All conversations are encrypted and confidential.',
    },
    {
      icon: <Users className="w-8 h-8 text-u-recover-green" />,
      title: 'Gender-Matched Support',
      description: 'Get paired with counsellors who understand your unique perspective and experiences.',
    },
    {
      icon: <Clock className="w-8 h-8 text-u-recover-green" />,
      title: '24/7 Availability',
      description: 'Access support when you need it most, with flexible scheduling options.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      rating: 5,
      text: 'MindHeal helped me through my darkest moments. The counsellor was understanding and professional.',
    },
    {
      name: 'John D.',
      rating: 5,
      text: 'The platform is easy to use and the resources are incredibly helpful. Highly recommended!',
    },
    {
      name: 'Emily R.',
      rating: 5,
      text: 'Finally found a mental health platform that truly cares. The support has been life-changing.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-u-recover-green to-green-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Mental Health
              <span className="block text-green-200">Matters</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-green-100 max-w-3xl mx-auto">
              Connect with qualified counsellors, access valuable resources, and take control of your mental wellness journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-u-recover-green hover:bg-gray-100"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
              </Button>
              <Link to="/talk-to-counsellor">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-u-recover-green">
                  Talk to a Counsellor
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Why Choose MindHeal?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              We provide comprehensive mental health support tailored to your unique needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive mental health support at your fingertips.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  One-on-One Counselling
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Private sessions with licensed mental health professionals tailored to your needs.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-u-recover-green mr-2" />
                    Gender-matched counsellors
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-u-recover-green mr-2" />
                    Flexible scheduling
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-u-recover-green mr-2" />
                    Secure messaging
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Mental Health Resources
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Access a comprehensive library of mental health resources and tools.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-u-recover-green mr-2" />
                    Educational articles
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-u-recover-green mr-2" />
                    Self-help guides
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-u-recover-green mr-2" />
                    Wellness activities
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardContent>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Progress Tracking
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Monitor your mental health journey with our comprehensive tracking tools.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-u-recover-green mr-2" />
                    Mood tracking
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-u-recover-green mr-2" />
                    Progress reports
                  </li>
                  <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 text-u-recover-green mr-2" />
                    Goal setting
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Real stories from people who found hope and healing through MindHeal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <CardContent>
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                    "{testimonial.text}"
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    - {testimonial.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-u-recover-green text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-green-100 max-w-2xl mx-auto">
            Take the first step towards better mental health. Join thousands who have found support and healing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="bg-white text-u-recover-green hover:bg-gray-100">
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/talk-to-counsellor">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-u-recover-green">
                Talk to a Counsellor
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};