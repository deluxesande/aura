import Navbar from "@/components/Navbar";

const CustomerForm = () => {
    return (
        <Navbar>
            <div className="isolate h-[100%] card bg-white shadow-lg rounded-lg flex items-center justify-center">
                <form className="mx-auto max-w-xl space-y-6">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-balance text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                            Customer Details
                        </h2>
                        <p className="mt-2 text-lg/8 text-gray-600">
                            Please fill in the necessary details.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                        <div>
                            <label
                                htmlFor="firstName"
                                className="block text-sm/6 font-semibold text-gray-900"
                            >
                                First Name
                            </label>
                            <div className="mt-2.5">
                                <input
                                    id="firstName"
                                    name="firstName"
                                    placeholder="Enter first name"
                                    type="text"
                                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-400"
                                />
                            </div>
                        </div>
                        <div>
                            <label
                                htmlFor="lastName"
                                className="block text-sm/6 font-semibold text-gray-900"
                            >
                                Last Name
                            </label>
                            <div className="mt-2.5">
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    placeholder="Enter last name"
                                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-400"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-x-8 gap-y-6 mt-6">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm/6 font-semibold text-gray-900"
                            >
                                Email
                            </label>
                            <div className="mt-2.5">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Enter email"
                                    className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-400"
                                />
                            </div>
                        </div>
                        <div>
                            <label
                                htmlFor="phoneNumber"
                                className="block text-sm/6 font-semibold text-gray-900"
                            >
                                Phone Number
                            </label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="text"
                                placeholder="Enter phone number"
                                className="block w-full rounded-md bg-white px-3.5 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-green-400"
                            />
                        </div>
                    </div>
                    <div className="mt-10">
                        <button
                            type="submit"
                            className="btn btn-md btn-ghost text-black flex items-center bg-green-400 w-full mt-8"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </Navbar>
    );
};

export default CustomerForm;
