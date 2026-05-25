import { useState } from 'react';
import { Mail, Clock, MapPin, MessageCircle, Send, Phone } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In real implementation, this would send to a backend
    const mailtoLink = `mailto:kiwikoru3d@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
    )}`;
    window.location.href = mailtoLink;
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-kiwi-light pt-24 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl lg:text-5xl font-heading font-semibold text-kiwi-dark mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-kiwi-base/70">
            Have a question or a custom project? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left - Contact Info */}
          <div>
            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-kiwi-base/10 flex-shrink-0">
                  <Mail className="w-5 h-5 text-kiwi-base" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-kiwi-dark text-sm mb-1">Email</h4>
                  <a
                    href="mailto:kiwikoru3d@gmail.com"
                    className="text-kiwi-base hover:text-kiwi-gold transition-colors"
                  >
                    kiwikoru3d@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-kiwi-base/10 flex-shrink-0">
                  <Phone className="w-5 h-5 text-kiwi-base" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-kiwi-dark text-sm mb-1">Phone</h4>
                  <a
                    href="tel:+640272602954"
                    className="text-kiwi-base hover:text-kiwi-gold transition-colors"
                  >
                    +64 027 260 2954
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-kiwi-base/10 flex-shrink-0">
                  <Clock className="w-5 h-5 text-kiwi-base" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-kiwi-dark text-sm mb-1">Collection Times</h4>
                  <p className="text-kiwi-base/70 text-sm">By Appointment Only</p>
                  <p className="text-kiwi-base/50 text-xs mt-1">
                    We will email you to arrange a collection time once your print is complete.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-kiwi-base/10 flex-shrink-0">
                  <MapPin className="w-5 h-5 text-kiwi-base" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-kiwi-dark text-sm mb-1">Location</h4>
                  <p className="text-kiwi-base/70 text-sm">Morningside, Whangārei, New Zealand</p>
                  <p className="text-kiwi-base/50 text-xs mt-1">
                    Full address provided after order confirmation.
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/640272602954"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl transition-colors mb-8"
            >
              <MessageCircle className="w-6 h-6" />
              <div>
                <p className="font-medium">Chat on WhatsApp</p>
                <p className="text-green-100 text-sm">Usually reply within minutes</p>
              </div>
            </a>

            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white aspect-video flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="w-10 h-10 text-kiwi-base/30 mx-auto mb-3" />
                <p className="text-kiwi-dark font-heading font-semibold mb-1">Our Local Presence</p>
                <p className="text-kiwi-base/50 text-sm">Morningside, Whangārei</p>
                <a
                  href="https://www.google.com/maps/search/Morningside,+Whangārei,+New+Zealand"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-kiwi-base hover:text-kiwi-gold text-sm mt-2 inline-block underline"
                >
                  View on Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* Right - Contact Form */}
          <div>
            <div className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200">
              <h3 className="text-xl font-heading font-semibold text-kiwi-dark mb-1">Send a Message</h3>
              <p className="text-kiwi-base/50 text-sm mb-6">We usually reply within a few hours.</p>

              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Send className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-heading font-semibold text-kiwi-dark mb-2">Message Sent!</h4>
                  <p className="text-kiwi-base/60 text-sm">We'll get back to you as soon as possible.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium tracking-wider uppercase text-kiwi-base/60 mb-1 block">
                        Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-kiwi-dark text-sm focus:outline-none focus:ring-2 focus:ring-kiwi-base/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium tracking-wider uppercase text-kiwi-base/60 mb-1 block">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="you@example.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-kiwi-dark text-sm focus:outline-none focus:ring-2 focus:ring-kiwi-base/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium tracking-wider uppercase text-kiwi-base/60 mb-1 block">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="What can we help with?"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-kiwi-dark text-sm focus:outline-none focus:ring-2 focus:ring-kiwi-base/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium tracking-wider uppercase text-kiwi-base/60 mb-1 block">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your project..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-kiwi-dark text-sm focus:outline-none focus:ring-2 focus:ring-kiwi-base/20 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-kiwi-gold hover:bg-kiwi-goldDark text-kiwi-dark py-3 rounded-lg font-medium transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
