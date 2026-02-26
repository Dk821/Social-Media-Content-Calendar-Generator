import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
    User, Mail, Calendar, BarChart3, Heart, FileText,
    Edit3, Check, X, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/axiosConfig";

const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [nameInput, setNameInput] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get("/api/user/profile");
                setProfile(res.data);
                setNameInput(res.data.name || "");
            } catch (err) {
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSaveName = async () => {
        if (!nameInput.trim()) {
            toast.error("Name cannot be empty");
            return;
        }
        setSaving(true);
        try {
            const res = await api.put("/api/user/profile", { name: nameInput.trim() });
            setProfile(res.data);
            setEditing(false);
            toast.success("Profile updated!");
        } catch {
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric"
            });
        } catch {
            return dateStr;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F7FB] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-gray-400 text-sm">Loading profile...</p>
                </div>
            </div>
        );
    }

    const stats = [
        {
            label: "Calendars",
            value: profile?.total_calendars || 0,
            icon: Calendar,
            color: "from-blue-500 to-blue-600",
            bgLight: "bg-blue-50",
            textColor: "text-blue-600",
        },
        {
            label: "Total Posts",
            value: profile?.total_posts || 0,
            icon: FileText,
            color: "from-purple-500 to-purple-600",
            bgLight: "bg-purple-50",
            textColor: "text-purple-600",
        },
        {
            label: "Favorites",
            value: profile?.favorites_count || 0,
            icon: Heart,
            color: "from-rose-500 to-rose-600",
            bgLight: "bg-rose-50",
            textColor: "text-rose-600",
        },
    ];

    return (
        <div className="min-h-screen bg-[#F5F7FB]">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden mb-6"
                >
                    {/* Banner */}
                    <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600 relative">
                        <div className="absolute inset-0 opacity-20" style={{
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Ccircle cx='6' cy='6' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                        }} />
                    </div>

                    {/* Avatar + Info */}
                    <div className="px-6 pb-6 -mt-12 relative">
                        <div className="flex items-end gap-4 mb-4">
                            {user?.photoURL ? (
                                <img
                                    src={user.photoURL}
                                    alt=""
                                    className="w-24 h-24 rounded-2xl border-4 border-white object-cover shadow-lg"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-2xl border-4 border-white bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                    <span className="text-3xl font-bold text-white">
                                        {(profile?.name || user?.email)?.[0]?.toUpperCase() || "U"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Name */}
                        <div className="flex items-center gap-3 mb-1">
                            {editing ? (
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={nameInput}
                                        onChange={(e) => setNameInput(e.target.value)}
                                        className="h-10 w-56 rounded-xl border-[#E5E7EB]"
                                        autoFocus
                                    />
                                    <Button
                                        size="sm"
                                        onClick={handleSaveName}
                                        disabled={saving}
                                        className="rounded-xl bg-green-500 hover:bg-green-600 text-white h-10 w-10 p-0"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => { setEditing(false); setNameInput(profile?.name || ""); }}
                                        className="rounded-xl h-10 w-10 p-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-2xl font-bold text-[#111827]">{profile?.name || "User"}</h1>
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Email */}
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Mail className="w-4 h-4" />
                            {profile?.email || user?.email}
                        </div>

                        {/* Member Since */}
                        <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                            <Calendar className="w-4 h-4" />
                            Member since {formatDate(profile?.joined_at)}
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <h2 className="text-lg font-semibold text-[#111827] mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Usage Analytics
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm"
                        >
                            <div className={`w-12 h-12 rounded-xl ${stat.bgLight} flex items-center justify-center mb-4`}>
                                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                            </div>
                            <p className="text-3xl font-bold text-[#111827] mb-1">{stat.value}</p>
                            <p className="text-gray-500 text-sm">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
