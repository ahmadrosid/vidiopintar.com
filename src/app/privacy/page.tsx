import Typography from "@/components/common/typography"
import MainLayout from "@/components/layouts/main-layout"

export default function PrivacyPolicy() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const htmlContent = `
  <h2>Introduction</h2>
  <p>Welcome to VidioPintar. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our video processing service.</p>

  <h2>Information We Collect</h2>
  <p>We collect the following types of information:</p>
  <h4>Personal Information</h4>
  <ul>
    <li>Email address when you create an account</li>
    <li>Name (optional) for account personalization</li>
    <li>Payment information for premium features</li>
  </ul>

  <h4>Usage Data</h4>
  <ul>
    <li>Video processing preferences and settings</li>
    <li>Service usage patterns and frequency</li>
    <li>Device and browser information</li>
    <li>IP address and general location data</li>
  </ul>

  <h4>Content Data</h4>
  <ul>
    <li>Videos you upload for processing</li>
    <li>Generated transcriptions and translations</li>
    <li>Processing preferences and output settings</li>
  </ul>

  <h2>How We Use Your Information</h2>
  <p>We use the collected information for the following purposes:</p>
  <ul>
    <li>To provide and maintain our video processing service</li>
    <li>To process your videos and deliver requested features</li>
    <li>To improve and optimize our service performance</li>
    <li>To communicate with you about your account and service updates</li>
    <li>To process payments for premium features</li>
    <li>To detect, prevent, and address technical issues</li>
    <li>To comply with legal obligations</li>
  </ul>

  <h2>Data Storage and Security</h2>
  <p>We implement appropriate technical and organizational measures to protect your  personal information against unauthorized access, alteration, disclosure, or destruction.</p>
  <ul>
    <li>All data transmissions are encrypted using industry-standard SSL/TLS protocols</li>
    <li>Videos are processed in secure, isolated environments</li>
    <li>Processed videos are automatically deleted after 30 days unless you choose to save them</li>
    <li>We use trusted cloud service providers with strong security certifications</li>
    <li>Access to personal data is restricted to authorized personnel only</li>
  </ul>

  <h2>Data Sharing and Third Parties</h2>
  <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following situations:</p>
  <ul>
    <li>With service providers who assist in operating our platform (e.g., cloud hosting, payment processing)</li>
    <li>To comply with legal obligations or respond to lawful requests</li>
    <li>To protect our rights, privacy, safety, or property</li>
    <li>With your explicit consent</li>
  </ul>

  <h2>Your Rights and Choices</h2>
  <p>You have the following rights regarding your personal information:</p>
  <ul>
    <li><strong>Access:</strong> Request a copy of your personal data</li>
    <li><strong>Correction:</strong> Request correction of inaccurate data</li>
    <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
    <li><strong>Data Portability:</strong> Request your data in a machine-readable format</li>
    <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
  </ul>
  <p>To exercise these rights, please contact us at <a href="mailto:privacy@vidiopintar.com">privacy@vidiopintar.com</a></p>

  <h2>Cookies and Tracking</h2>
  <p>We use cookies and similar tracking technologies to improve your experience on our platform:</p>
  <ul>
    <li><strong>Essential Cookies:</strong> Required for basic functionality and security</li>
    <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our service</li>
    <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
  </ul>
  <p>You can manage cookie preferences through your browser settings.</p>

  <h2>Children's Privacy</h2>
  <p>Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.</p>

  <h2>Changes to This Policy</h2>
  <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.</p>

  <h2>Contact Us</h2>
  <p>If you have any questions about this Privacy Policy or our data practices, please contact us:</p>
  <p> Email: <a href="mailto:support@vidiopintar.com">support@vidiopintar.com</a></p>
  <p> Website: <a href="https://vidiopintar.com">vidiopintar.com</a></p>
  `

  return (
    <MainLayout>
      <main className="bg-background">
        <div className="relative isolate">
          <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-5xl px-6">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mb-8">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground mb-12">Last updated: {lastUpdated}</p>

              <Typography html={htmlContent} />
            </div>
          </div>
        </div>
      </main>
    </MainLayout>
  )
}
