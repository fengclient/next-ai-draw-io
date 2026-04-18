"use client"

import { Eye, EyeOff, Globe, Lock } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const translations = {
    en: {
        title: "Access Restricted",
        description: "Please enter your invitation code to continue",
        passwordLabel: "Invitation Code",
        passwordPlaceholder: "Enter your code",
        error: "Invalid code, please try again",
        serverError: "Verification failed, please try again later",
        submit: "Enter Application",
        loading: "Verifying...",
        language: "Language",
    },
    zh: {
        title: "访问受限",
        description: "请输入邀请码以继续",
        passwordLabel: "邀请码",
        passwordPlaceholder: "请输入邀请码",
        error: "邀请码无效，请重试",
        serverError: "验证失败，请稍后重试",
        submit: "进入应用",
        loading: "验证中...",
        language: "语言",
    },
    ja: {
        title: "アクセス制限",
        description: "続行するには招待コードを入力してください",
        passwordLabel: "招待コード",
        passwordPlaceholder: "コードを入力",
        error: "無効なコードです。もう一度お試しください",
        serverError: "検証に失敗しました。後でもう一度お試しください",
        submit: "アプリに入る",
        loading: "検証中...",
        language: "言語",
    },
    "zh-Hant": {
        title: "訪問受限",
        description: "請輸入邀請碼以繼續",
        passwordLabel: "邀請碼",
        passwordPlaceholder: "請輸入邀請碼",
        error: "邀請碼無效，請重試",
        serverError: "驗證失敗，請稍後重試",
        submit: "進入應用",
        loading: "驗證中...",
        language: "語言",
    },
}

type Locale = keyof typeof translations

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const from = searchParams.get("from") || "/"

    const [locale, setLocale] = useState<Locale>("zh")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const t = translations[locale]

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/verify-access-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password, locale }),
            })

            const data = await response.json()

            if (data.success) {
                // Cookie is set by server
                router.push(from)
                router.refresh()
            } else {
                setError(t.error)
            }
        } catch {
            setError(t.serverError)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-xl shadow-xl p-8">
                <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">{t.title}</h1>
                    <p className="text-muted-foreground">{t.description}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="language">{t.language}</Label>
                        <Select
                            value={locale}
                            onValueChange={(v) => setLocale(v as Locale)}
                        >
                            <SelectTrigger className="w-full">
                                <Globe className="w-4 h-4 mr-2" />
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="zh">简体中文</SelectItem>
                                <SelectItem value="zh-Hant">
                                    繁體中文
                                </SelectItem>
                                <SelectItem value="ja">日本語</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">{t.passwordLabel}</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t.passwordPlaceholder}
                                className="pr-10"
                                required
                                autoComplete="off"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || !password.trim()}
                    >
                        {isLoading ? t.loading : t.submit}
                    </Button>
                </form>
            </div>
        </div>
    )
}

function LoginPageSkeleton() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-xl shadow-xl p-8">
                <div className="text-center mb-6">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">
                        Access Restricted
                    </h1>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<LoginPageSkeleton />}>
            <LoginForm />
        </Suspense>
    )
}
