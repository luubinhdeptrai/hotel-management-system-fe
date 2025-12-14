"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Hotel } from "lucide-react";
import { Input } from "@/components/ui/input";
import { authService } from "@/lib/services/auth.service";
import { ApiError } from "@/lib/services/api";
import { mockLogin } from "@/lib/mock-auth";

// Toggle this to use mock login during development when backend is unavailable
const USE_MOCK_AUTH = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true";

interface LoginCredentials {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      if (USE_MOCK_AUTH) {
        // Use mock login for development
        const response = await mockLogin({
          username: credentials.email,
          password: credentials.password,
        });

        if (response.success && response.user) {
          router.push("/dashboard");
        } else {
          setErrorMessage(response.message || "Đăng nhập thất bại");
        }
      } else {
        // Use real API
        const response = await authService.login(
          credentials.email,
          credentials.password
        );

        console.log("Login response:", response);

        // If we reach here without error, login was successful
        // authService.login() throws on failure
        router.push("/dashboard");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 401) {
          setErrorMessage("Email hoặc mật khẩu không đúng");
        } else if (error.statusCode === 0) {
          setErrorMessage(
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng."
          );
        } else {
          setErrorMessage(
            error.message || "Có lỗi xảy ra. Vui lòng thử lại sau."
          );
        }
      } else {
        setErrorMessage("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background with gradients */}
      <div className="absolute inset-0 bg-white" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 30%, rgba(125, 211, 252, 1) 0%, rgba(94, 158, 189, 0.75) 12.5%, rgba(63, 106, 126, 0.5) 25%, rgba(31, 53, 63, 0.25) 37.5%, rgba(0, 0, 0, 0) 50%), radial-gradient(circle at 80% 70%, rgba(20, 184, 166, 1) 0%, rgba(15, 138, 125, 0.75) 12.5%, rgba(10, 92, 83, 0.5) 25%, rgba(5, 46, 42, 0.25) 37.5%, rgba(0, 0, 0, 0) 50%)`,
        }}
      />

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-5">
        {/* Header with icon and title */}
        <div className="flex flex-col items-center gap-4">
          <div className="bg-sky-600 rounded-3xl shadow-[0px_1px_4px_0px_rgba(0,0,0,0.15)] w-14 h-14 flex items-center justify-center">
            <Hotel className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-base font-normal text-neutral-950 tracking-[-0.3125px] text-center">
            Hệ thống Quản lý Khách sạn
          </h1>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-[416px] bg-[rgba(255,255,255,0.95)] border border-[rgba(0,0,0,0.1)] rounded-[14px] shadow-sm">
          {/* Card Header */}
          <div className="px-6 pt-6 pb-0">
            <h2 className="text-base font-medium text-neutral-950 tracking-[-0.3125px] text-center mb-1.5">
              Chào mừng trở lại
            </h2>
            <p className="text-base font-normal text-[#717182] tracking-[-0.3125px] text-center">
              Nhập thông tin đăng nhập để truy cập hệ thống
            </p>
          </div>

          {/* Card Content - Form */}
          <div className="px-6 py-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {errorMessage && (
                <div className="bg-error-100 border border-error-600 text-error-600 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-950 tracking-[-0.1504px]"
                >
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials({
                      ...credentials,
                      email: e.target.value,
                    })
                  }
                  className="h-9 bg-[#f3f3f5] border-transparent rounded-lg px-3 py-1 text-sm tracking-[-0.1504px] placeholder:text-[#717182]"
                  placeholder="Nhập email"
                  disabled={isLoading}
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-neutral-950 tracking-[-0.1504px]"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({
                        ...credentials,
                        password: e.target.value,
                      })
                    }
                    className="h-9 bg-[#f3f3f5] border-transparent rounded-lg px-3 py-1 pr-10 text-sm tracking-[-0.1504px] placeholder:text-[#717182]"
                    placeholder="Nhập mật khẩu"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-[#717182] hover:text-neutral-950" />
                    ) : (
                      <Eye className="h-4 w-4 text-[#717182] hover:text-neutral-950" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full h-9 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium tracking-[-0.1504px] rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
            </form>
          </div>

          {/* Card Footer */}
          <div className="border-t border-[rgba(0,0,0,0.1)] px-6 py-6 flex flex-col items-center gap-3">
            <a
              href="#"
              className="text-sm font-medium text-sky-600 hover:text-sky-700 tracking-[-0.1504px]"
            >
              Quên mật khẩu?
            </a>
            <p className="text-sm text-[#717182] tracking-[-0.1504px] text-center">
              Chưa có tài khoản?{" "}
              <a
                href="#"
                className="font-medium text-sky-600 hover:text-sky-700"
              >
                Đăng ký
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
