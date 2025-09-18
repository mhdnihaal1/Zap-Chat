import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useStateProvider } from "@/context/StateContext";
import Input from "@/components/common/Input";
import Avatar from "@/components/common/Avatar";
import { useRouter } from "next/router";
import axios from "axios";
import { ONBOARD_USER_ROUTE  } from "../utils/ApiRoutes.js";
import { reducerCases } from "@/context/constants.js";

function Onboarding() {
  const router = useRouter();
  const [{ userInfo, newUser }, dispatch] = useStateProvider();
  const [name, setName] = useState(userInfo?.name || "");
  const [about, setAbout] = useState("");
  const [image, setImage] = useState(userInfo?.profileImage || "/default_avatar.png");

  useEffect(() => {
    if (!newUser && !userInfo?.email) router.push("/login");
    else if (!newUser && userInfo?.email) router.push("/");
  }, [newUser, userInfo, router]);
 if (userInfo === undefined) return;

  const onboardUserHandler = async () => {
    if (validateDetails()) {
      const email = userInfo.email;
      try {
        const { data } = await axios.post(`http://localhost:5000/api/auth/onboard-user`, {
          email,
          name,
          about,
          image,
        });
        if (data?.status) {
          dispatch({ type: reducerCases.SET_NEW_USER, newUser: false });
          dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              id: data?.user?.id,
              name,
              email,
              profileImage: image,
              status: about,
            },
          });
          router.push("/");
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const validateDetails = () => {
    if (name.length < 3) {
      return false;
    }
    return true;
  };
  return (
     <div className="bg-panel-header-background h-screen w-screen text-white flex flex-col items-center justify-center px-4">
      {/* Logo and heading */}
      <div className="flex items-center justify-center gap-3 mb-4">
        <Image src="/whatsapp.gif" alt="ZapChat" height={80} width={80} />
        <span className="text-5xl font-bold tracking-wide">ZapChat</span>
      </div>

      <h2 className="text-xl text-gray-300 mb-8">Create your profile</h2>

      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-10 bg-gray-800 p-8 rounded-2xl shadow-lg">
        {/* Left - Form */}
        <div className="flex flex-col gap-6 w-full md:w-80">
          <Input name="Display Name" state={name} setState={setName} label />
          <Input name="About" state={about} setState={setAbout} label />

          <button
            className="mt-4 bg-emerald-500 hover:bg-emerald-600 transition-all px-6 py-3 rounded-lg font-semibold text-lg shadow-md"
            onClick={onboardUserHandler}
          >
            Create Profile
          </button>
        </div>

        {/* Right - Avatar */}
        <div className="flex items-center justify-center">
          <Avatar type="xl" image={image} setImage={setImage} />
        </div>
      </div>
    </div>
  );
}

export default Onboarding;
