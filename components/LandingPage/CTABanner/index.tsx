export default function CTABanner() {
    return (
        <section className="bg-gray-50 py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-green-600 rounded-2xl p-8 md:p-12 shadow-sm border border-green-100">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Ready to grow your business?
                        </h2>
                        <p className="text-gray-50 mb-8">
                            Join thousands of Kenyan businesses using SaleSense
                            to manage their operations.
                        </p>
                        <a
                            href="/sign-up"
                            className="bg-gray-50 text-green-600 px-8 py-3 rounded-lg hover:text-gray-50 hover:bg-green-700 transition-colors"
                        >
                            Get Started Now
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
