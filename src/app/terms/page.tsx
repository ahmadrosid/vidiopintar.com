import { HeroHeader } from "@/components/hero-header";
import { FooterSection } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsOfService() {
  return (
    <>
      <HeroHeader />
      <main className="bg-background">
        <div className="relative isolate">
          <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-5xl px-6">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-8">
                Terms of Service
              </h1>
              <p className="text-muted-foreground mb-12">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <div className="prose prose-gray dark:prose-invert max-w-none space-y-8">
                <Card className="border-none shadow-none p-0">
                  <CardContent className="p-0">
                    <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                    <p className="text-muted-foreground">
                      By accessing and using VidioPintar ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service. We reserve the right to update these Terms at any time, and your continued use of the Service constitutes acceptance of any changes.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-none p-0">
                  <CardContent className="p-0">
                    <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        VidioPintar provides an AI-powered video processing platform that offers:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Video transcription and caption generation</li>
                        <li>Multi-language translation services</li>
                        <li>Subtitle embedding and formatting</li>
                        <li>Video enhancement and processing tools</li>
                        <li>Cloud-based storage for processed videos</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-none p-0">
                  <CardContent className="p-0">
                    <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>To use certain features of our Service, you must create an account. You agree to:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Provide accurate, current, and complete information</li>
                        <li>Maintain and update your information to keep it accurate</li>
                        <li>Keep your account credentials secure and confidential</li>
                        <li>Notify us immediately of any unauthorized access</li>
                        <li>Be responsible for all activities under your account</li>
                      </ul>
                      <p className="mt-4">
                        We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent or illegal activities.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-none p-0">
                  <CardContent className="p-0">
                    <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use Policy</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>You agree NOT to use our Service to:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Upload or process content that violates any law or regulation</li>
                        <li>Infringe upon intellectual property rights of others</li>
                        <li>Upload content that is harmful, offensive, or discriminatory</li>
                        <li>Distribute malware, viruses, or other harmful code</li>
                        <li>Attempt to gain unauthorized access to our systems</li>
                        <li>Use the Service for any illegal or unauthorized purpose</li>
                        <li>Resell or redistribute the Service without permission</li>
                        <li>Process content containing violence, adult content, or hate speech</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-none p-0">
                  <CardContent className="p-0">
                    <h2 className="text-2xl font-semibold mb-4">5. Content Ownership and License</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <div>
                        <h3 className="text-lg font-medium text-foreground mb-2">Your Content</h3>
                        <p>
                          You retain all ownership rights to the videos and content you upload. By using our Service, you grant us a limited, non-exclusive license to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                          <li>Process your content to provide the requested services</li>
                          <li>Store your content on our servers</li>
                          <li>Display your content back to you through the Service</li>
                          <li>Create backups for service reliability</li>
                        </ul>
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-medium text-foreground mb-2">Our Content</h3>
                        <p>
                          The Service, including its design, features, and content (excluding user content), is owned by VidioPintar and protected by intellectual property laws. You may not copy, modify, or reverse engineer any part of our Service.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-none p-0">
                  <CardContent className="p-0">
                    <h2 className="text-2xl font-semibold mb-4">6. Payment and Billing</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        For premium features, you agree to:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Pay all fees according to your selected plan</li>
                        <li>Provide valid payment information</li>
                        <li>Authorize us to charge your payment method</li>
                        <li>Be responsible for all taxes applicable to your use</li>
                      </ul>
                      <div className="mt-4">
                        <h3 className="text-lg font-medium text-foreground mb-2">Refund Policy</h3>
                        <p>
                          We offer a 7-day money-back guarantee for first-time subscribers. Refunds are not available for:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mt-2">
                          <li>Accounts terminated for Terms violations</li>
                          <li>Partially used billing periods</li>
                          <li>Processing credits already consumed</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-none p-0">
                  <CardContent className="p-0">
                    <h2 className="text-2xl font-semibold mb-4">7. Service Limitations</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>Our Service has certain limitations:</p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Maximum video file size: 2GB (free) / 10GB (premium)</li>
                        <li>Processing time limits based on your plan</li>
                        <li>Storage duration: 30 days for processed videos</li>
                        <li>API rate limits to ensure fair usage</li>
                        <li>Quality of AI-generated content may vary</li>
                      </ul>
                      <p className="mt-4">
                        We reserve the right to modify these limitations and will notify users of significant changes.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-none p-0">
                  <CardContent className="p-0">
                    <h2 className="text-2xl font-semibold mb-4">8. Privacy and Data Protection</h2>
                    <p className="text-muted-foreground">
                      Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. By using our Service, you consent to our data practices as described in the Privacy Policy.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-none p-0">
                  <CardContent className="p-0">
                    <h2 className="text-2xl font-semibold mb-4">9. Disclaimers and Warranties</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p className="uppercase font-semibold">
                        The service is provided "as is" without warranties of any kind.
                      </p>
                      <p>
                        We do not warrant that:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>The Service will be uninterrupted or error-free</li>
                        <li>AI-generated content will be 100% accurate</li>
                        <li>The Service will meet all your requirements</li>
                        <li>All defects or errors will be corrected</li>
                      </ul>
                      <p className="mt-4">
                        You use the Service at your own risk. We recommend reviewing all AI-generated content before use.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-none p-0">
                  <CardContent className="p-0">
                    <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p className="uppercase font-semibold">
                        To the maximum extent permitted by law:
                      </p>
                      <p>
                        VidioPintar and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Loss of profits or revenue</li>
                        <li>Loss of data or content</li>
                        <li>Business interruption</li>
                        <li>Costs of substitute services</li>
                      </ul>
                      <p className="mt-4">
                        Our total liability shall not exceed the amount paid by you to us in the 12 months preceding the claim.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-none p-0">
                  <CardContent className="p-0">
                    <h2 className="text-2xl font-semibold mb-4">11. Indemnification</h2>
                    <p className="text-muted-foreground">
                      You agree to indemnify, defend, and hold harmless VidioPintar, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service, violation of these Terms, or infringement of any third-party rights.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-none p-0">
                  <CardContent className="p-0">
                    <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        Either party may terminate this agreement:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>By you: Cancel your account at any time through account settings</li>
                        <li>By us: For any violation of these Terms with or without notice</li>
                        <li>Automatically: If your account remains inactive for 12 months</li>
                      </ul>
                      <p className="mt-4">
                        Upon termination, your right to use the Service ceases immediately. We may delete your content after 30 days of account termination.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-none p-0">
                  <CardContent className="p-0">
                    <h2 className="text-2xl font-semibold mb-4">13. Governing Law and Disputes</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.
                      </p>
                      <p>
                        Any disputes arising from these Terms shall be resolved through:
                      </p>
                      <ol className="list-decimal pl-6 space-y-2">
                        <li>Good faith negotiations between the parties</li>
                        <li>Mediation if negotiations fail</li>
                        <li>Binding arbitration as a last resort</li>
                      </ol>
                      <p className="mt-4">
                        You waive any right to a jury trial or to participate in a class action lawsuit.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-none p-0">
                  <CardContent className="p-0">
                    <h2 className="text-2xl font-semibold mb-4">14. General Provisions</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and VidioPintar</li>
                        <li><strong>Severability:</strong> If any provision is found invalid, the remaining provisions continue in full force</li>
                        <li><strong>No Waiver:</strong> Our failure to enforce any right does not constitute a waiver</li>
                        <li><strong>Assignment:</strong> You may not assign these Terms without our written consent</li>
                        <li><strong>Notices:</strong> We may notify you via email or through the Service</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-none p-0">
                  <CardContent className="p-0">
                    <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
                    <div className="space-y-3 text-muted-foreground">
                      <p>
                        For questions about these Terms of Service, please contact us:
                      </p>
                      <div>
                        <p>Email: legal@vidiopintar.com</p>
                        <p>Website: vidiopintar.com</p>
                        <p>Support: support@vidiopintar.com</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterSection />
    </>
  );
}