"use client";  // 添加这个指令
import React, { useEffect, useState } from "react";
import supabase from "@/lib/supabase";

// HomeDisplay.tsx 中展示结构（条件渲染）
const HomeDisplay = () => {
    const [hasPartner, setHasPartner] = useState(false);
    const [inviteId, setInviteId] = useState('');
    const [userHappiness, setUserHappiness] = useState<number | null>(null);
    const [partnerHappiness, setPartnerHappiness] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [partnerId, setPartnerId] = useState<string | null>(null);

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

            // 获取用户的幸福度信息
            const { data: userData, error: userError } = await supabase
                .from('User')
                .select('happiness')
                .eq('uid', user.id)
                .single();

            if (userError) throw userError;

            console.log('用户幸福度数据:', userData);

            if (userData) {
                setUserHappiness(userData.happiness);

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

                    // 获取配对用户的幸福度
                    const { data: partnerData, error: partnerError } = await supabase
                        .from('User')
                        .select('happiness')
                        .eq('uid', partnerUid)
                        .single();

                    if (partnerError) throw partnerError;
                    if (partnerData) {
                        console.log('配对用户幸福度数据:', partnerData);
                        setPartnerHappiness(partnerData.happiness);
                    }
                } else {
                    console.log('用户未配对');
                    setHasPartner(false);
                    setPartnerId(null);
                    setPartnerHappiness(null);
                }
            }
        } catch (error) {
            console.error('获取用户数据时出错:', error);
        } finally {
            setLoading(false);
            console.log('数据加载完成，当前状态:', {
                hasPartner,
                userHappiness,
                partnerHappiness,
                partnerId,
                loading
            });
        }
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
            {/* 幸福度 */}
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h2>相手の幸福度</h2>
                    <div className="text-4xl font-bold">{partnerHappiness ?? 0}%</div>
                </div>
            </div>

            {/* 自己的幸福度 */}
            <div className="absolute top-4 right-4 text-right">
                <div className="text-sm text-gray-600">自分の幸福度</div>
                <div className="text-xl font-bold text-gray-600">{userHappiness ?? 0}%</div>
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
