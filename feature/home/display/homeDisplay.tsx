"use client";  // 添加这个指令
import React, { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import LogoutButton from '@/components/LogoutButton';

// HomeDisplay.tsx 中展示结构（条件渲染）
const HomeDisplay = () => {
    const [hasPartner, setHasPartner] = useState(false);
    const [inviteId, setInviteId] = useState('');
    const [userHappiness, setUserHappiness] = useState<number | null>(null);
    const [partnerHappiness, setPartnerHappiness] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [partnerId, setPartnerId] = useState<string | null>(null);
    const [userGender, setUserGender] = useState<string | null>(null);
    const [partnerGender, setPartnerGender] = useState<string | null>(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            // 获取当前登录用户
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                console.error('用户未登录');
                return;
            }

            console.log('当前登录用户:', user);

            // 获取用户的幸福度和性别信息
            const { data: userData, error: userError } = await supabase
                .from('User')
                .select('happiness, gender')
                .eq('uid', user.id)
                .single();

            if (userError) throw userError;

            console.log('用户幸福度数据:', userData);

            setUserHappiness(userData.happiness);
            setUserGender(userData.gender);

            // 检查配对关系
            const { data: coupleData, error: coupleError } = await supabase
                .from('Couple')
                .select('uid1, uid2')
                .or(`uid1.eq.${user.id},uid2.eq.${user.id}`)
                .single();

            console.log('配对关系数据:', coupleData);

            if (coupleError && coupleError.code !== 'PGRST116') { // PGRST116 是没有找到记录的错误
                throw coupleError;
            }

            if (coupleData) {
                setHasPartner(true);
                // 确定配对用户的ID
                const partnerUid = coupleData.uid1 === user.id ? coupleData.uid2 : coupleData.uid1;
                setPartnerId(partnerUid);

                console.log('配对用户ID:', partnerUid);

                // 获取配对用户的幸福度和性别
                const { data: partnerData, error: partnerError } = await supabase
                    .from('User')
                    .select('happiness, gender')
                    .eq('uid', partnerUid)
                    .single();

                if (partnerError) throw partnerError;
                if (partnerData) {
                    console.log('配对用户幸福度数据:', partnerData);
                    setPartnerHappiness(partnerData.happiness);
                    setPartnerGender(partnerData.gender);
                }
            } else {
                console.log('用户未配对');
                setHasPartner(false);
                setPartnerId(null);
                setPartnerHappiness(null);
                setPartnerGender(null);
            }

            // 控制台输出所有信息
            console.log('【用户信息】', userData);
            console.log('【用户性别】', userData.gender);
            console.log('【用户幸福度】', userData.happiness);
            console.log('【配对信息】', coupleData);
            if (coupleData) {
                console.log('【配对用户ID】', coupleData.uid1 === user.id ? coupleData.uid2 : coupleData.uid1);
            }
            console.log('【配对用户信息】', partnerGender, partnerHappiness);
        } catch (error) {
            console.error('获取用户数据时出错:', error);
        } finally {
            setLoading(false);
            console.log('【最终状态】', {
                hasPartner,
                userHappiness,
                partnerHappiness,
                partnerId,
                userGender,
                partnerGender,
                loading
            });
        }
    };

    // 颜色选择逻辑
    const getBarColor = (gender: string | null, type: 'bg' | 'gradient') => {
        if (!gender) return type === 'gradient' ? 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500' : 'bg-gray-300';
        if (gender === '女' || gender.toLowerCase() === 'female') {
            return type === 'gradient'
                ? 'bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600'
                : 'bg-pink-100';
        }
        if (gender === '男' || gender.toLowerCase() === 'male') {
            return type === 'gradient'
                ? 'bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600'
                : 'bg-blue-100';
        }
        return type === 'gradient' ? 'bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500' : 'bg-gray-300';
    };

    // 边框颜色逻辑
    const getBorderColor = (gender: string | null) => {
        if (!gender) return 'border-gray-300';
        if (gender === '女' || gender.toLowerCase() === 'female') return 'border-pink-300';
        if (gender === '男' || gender.toLowerCase() === 'male') return 'border-blue-300';
        return 'border-gray-300';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>読み込み中...</p>
            </div>
        );
    }

    if (!hasPartner) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-center px-4">
                <p className="text-xl mb-6">招待しょう！</p>

                <input
                    type="text"
                    value={inviteId}
                    onChange={(e) => setInviteId(e.target.value)}
                    placeholder="IDを入力"
                    className="border border-gray-300 rounded px-4 py-2 mb-4 w-full max-w-xs"
                />

                <button
                    onClick={() => alert(`ID ${inviteId} に招待を送りました！`)}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded"
                >
                    招待
                </button>
            </div>
        );
    }

    return (
        <div className="relative p-6 h-screen">
            {/* 左上角登出按钮（白色） */}
            <div className="absolute top-2 left-2 z-50">
                <LogoutButton />
            </div>
            {/* 相手の幸福度（居中，花哨版，数字居中，动态颜色+动态边框） */}
            <div className="flex items-center justify-center h-full">
                <div className="w-full max-w-xs">
                    <div className="text-center text-gray-600 mb-1">相手の幸福度</div>
                    <div className={`relative w-full h-5 ${getBarColor(partnerGender, 'bg')} rounded-full shadow-inner overflow-hidden ${getBorderColor(partnerGender)}`}>
                        <div
                            className={`h-full rounded-full ${getBarColor(partnerGender, 'gradient')} shadow-lg transition-all duration-700 relative`}
                            style={{ width: `${partnerHappiness ?? 0}%` }}
                        ></div>
                        {/* 百分比数字固定在进度条正中间 */}
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow">
                            {partnerHappiness ?? 0}%
                        </span>
                    </div>
                </div>
            </div>

            {/* 自分の幸福度（右上角，动态颜色+数字居中，宽度60%+动态边框） */}
            <div className="absolute top-4 right-4 w-24">
                <div className="text-sm text-gray-600 mb-1 text-right">自分の幸福度</div>
                <div className={`relative w-full h-4 ${getBarColor(userGender, 'bg')} rounded-full overflow-hidden ${getBorderColor(userGender)}`}>
                    <div
                        className={`h-full ${getBarColor(userGender, 'gradient')} rounded-full transition-all duration-500`}
                        style={{ width: `${userHappiness ?? 0}%` }}
                    ></div>
                    {/* 百分比数字固定在进度条正中间 */}
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white drop-shadow">
                        {userHappiness ?? 0}%
                    </span>
                </div>
            </div>

            <div className="fixed bottom-20 left-4">
                <button className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg">
                    ▶️
                </button>
            </div>
        </div>
    );
};

export default HomeDisplay;
