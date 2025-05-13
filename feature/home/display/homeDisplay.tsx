"use client";  
import React, { useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import LogoutButton from '@/components/LogoutButton';
import { useRouter } from "next/navigation";

// HomeDisplay.tsx 中展示结构（条件渲染）
const HomeDisplay = () => {
    const router = useRouter();
    const [hasPartner, setHasPartner] = useState(false);
    const [inviteId, setInviteId] = useState('');
    const [userHappiness, setUserHappiness] = useState<number | null>(null);
    const [partnerHappiness, setPartnerHappiness] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [partnerId, setPartnerId] = useState<string | null>(null);
    const [userGender, setUserGender] = useState<string | null>(null);
    const [partnerGender, setPartnerGender] = useState<string | null>(null);
    const [pendingInvites, setPendingInvites] = useState<any[]>([]);
    const [sentInvites, setSentInvites] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [partnerName, setPartnerName] = useState<string | null>(null);
    const [recentActions, setRecentActions] = useState<Array<{
        action_name: string;
        timestamp: string;
        happiness_change: number;
    }>>([]);
    // 添加弹出框状态
    const [showTimeModal, setShowTimeModal] = useState(false);
    const [selectedTimeRange, setSelectedTimeRange] = useState<'1日' | '1週間' | '1ヶ月'>('1日');
    // 添加断开配对确认弹窗状态
    const [showBreakupModal, setShowBreakupModal] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);

    // 检查登录状态
    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.log('用户未登录，跳转到首页');
                router.push('/');
                return;
            }
        };
        checkAuth();
    }, [router]);

    const fetchUserData = async () => {
        try {
            // 获取当前登录用户
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                console.error('用户未登录');
                return;
            }

            console.log('当前登录用户:', user);

            // 获取用户的幸福度、性别和名字信息
            const { data: userData, error: userError } = await supabase
                .from('User')
                .select('happiness, gender, name')
                .eq('uid', user.id)
                .single();

            if (userError) throw userError;

            console.log('用户数据:', userData);

            setUserHappiness(userData.happiness);
            setUserGender(userData.gender);
            setUserName(userData.name);

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

                // 获取配对用户的幸福度、性别和名字
                const { data: partnerData, error: partnerError } = await supabase
                    .from('User')
                    .select('happiness, gender, name')
                    .eq('uid', partnerUid)
                    .single();

                if (partnerError) throw partnerError;
                if (partnerData) {
                    console.log('配对用户数据:', partnerData);
                    setPartnerHappiness(partnerData.happiness);
                    setPartnerGender(partnerData.gender);
                    setPartnerName(partnerData.name);
                }
            } else {
                console.log('用户未配对');
                setHasPartner(false);
                setPartnerId(null);
                setPartnerHappiness(null);
                setPartnerGender(null);
                setPartnerName(null);
            }

            // 获取用户最近的活动
            console.log('【开始查询活动】当前用户ID:', user.id);
            
            const { data: recentActionsData, error: actionsError } = await supabase
                .from('Calendar')
                .select(`
                    aid,
                    timestamp,
                    Action!inner (
                        action_name,
                        happiness_change,
                        uid
                    )
                `)
                .eq('Action.uid', user.id)
                .order('timestamp', { ascending: false })
                .limit(5);

            console.log('【查询结果】', {
                hasData: !!recentActionsData,
                dataLength: recentActionsData?.length,
                error: actionsError,
                rawData: recentActionsData
            });

            if (actionsError) {
                console.error('【查询错误】获取活动数据失败:', actionsError);
            } else if (!recentActionsData || recentActionsData.length === 0) {
                console.log('【查询结果】没有找到活动数据');
            } else {
                console.log('【数据详情】第一条记录示例:', JSON.stringify(recentActionsData[0], null, 2));
                
                // 添加数据检查和过滤
                const formattedActions = recentActionsData
                    .filter(record => {
                        console.log('【数据检查】检查记录:', {
                            recordExists: !!record,
                            hasAction: !!record?.Action,
                            isActionArray: Array.isArray(record?.Action),
                            actionLength: Array.isArray(record?.Action) ? record.Action.length : 1,
                            fullRecord: record
                        });
                        
                        // 检查记录和Action是否存在
                        const isValid = record && record.Action;
                            
                        if (!isValid) {
                            console.log('【数据过滤】记录无效原因:', {
                                recordMissing: !record,
                                actionMissing: !record?.Action
                            });
                        }
                        return isValid;
                    })
                    .map(record => {
                        // 处理 Action 可能是对象或数组的情况
                        const action = Array.isArray(record.Action) ? record.Action[0] : record.Action;
                        console.log('【数据处理】处理记录:', {
                            aid: record.aid,
                            timestamp: record.timestamp,
                            action: action
                        });
                        
                        if (!action) {
                            console.warn('【数据处理】跳过无效的活动记录:', record);
                            return null;
                        }
                        return {
                            action_name: action.action_name,
                            timestamp: record.timestamp,
                            happiness_change: action.happiness_change
                        };
                    })
                    .filter(action => action !== null);

                console.log('【最终数据】处理后的活动列表:', formattedActions);
                setRecentActions(formattedActions);
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

    // 获取当前登录用户
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        fetchUser();
    }, []);

    // 查询收到的邀请
    useEffect(() => {
        const fetchInvites = async () => {
            if (!user) {
                console.log('【查询邀请】用户未登录，无法查询邀请');
                return;
            }
            console.log('【查询邀请】开始查询收到的邀请，当前用户ID:', user.id);
            
            const { data, error } = await supabase
                .from('Invite')
                .select(`
                    *,
                    from_user:from_uid (
                        uid,
                        name
                    )
                `)
                .eq('to_uid', user.id)
                .eq('status', 'pending');
            
            if (error) {
                console.error('【查询邀请】查询收到的邀请失败:', error);
                return;
            }
            
            console.log('【查询邀请】收到的邀请数据:', data);
            setPendingInvites(data || []);
        };
        fetchInvites();
    }, [user]);

    // 查询自己发出的邀请
    useEffect(() => {
        const fetchSentInvites = async () => {
            if (!user) {
                console.log('【查询邀请】用户未登录，无法查询已发送的邀请');
                return;
            }
            console.log('【查询邀请】开始查询已发送的邀请，当前用户ID:', user.id);
            
            const { data, error } = await supabase
                .from('Invite')
                .select(`
                    *,
                    to_user:to_uid (
                        uid,
                        name
                    )
                `)
                .eq('from_uid', user.id)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('【查询邀请】查询已发送的邀请失败:', error);
                return;
            }
            
            console.log('【查询邀请】已发送的邀请数据:', data);
            setSentInvites(data || []);
        };
        fetchSentInvites();
    }, [user]);

    // 发起邀请
    const handleInvite = async () => {
        if (!inviteId) {
            alert('IDを入力してください');
            return;
        }
        if (inviteId === partnerId || inviteId === user?.id) {
            alert('自分自身や既に配对的用户を招待できません');
            return;
        }
        // 检查对方用户是否存在
        const { data: targetUser, error: userError } = await supabase
            .from('User')
            .select('uid')
            .eq('uid', inviteId)
            .single();
        if (userError || !targetUser) {
            alert('ユーザーが見つかりません');
            return;
        }
        // 检查是否已有pending邀请
        const { data: existingInvite } = await supabase
            .from('Invite')
            .select('*')
            .eq('from_uid', user.id)
            .eq('to_uid', inviteId)
            .eq('status', 'pending')
            .single();
        if (existingInvite) {
            alert('すでに招待中です');
            return;
        }
        // 插入邀请
        const { error: inviteError } = await supabase
            .from('Invite')
            .insert({ from_uid: user.id, to_uid: inviteId, status: 'pending' });
        if (inviteError) {
            alert('招待に失敗しました');
        } else {
            alert('招待を送りました！');
        }
    };

    // 同意邀请
    const handleAccept = async (invite: any) => {
        await supabase.from('Invite').update({ status: 'accepted' }).eq('id', invite.id);
        await supabase.from('Couple').insert({ uid1: invite.from_uid, uid2: invite.to_uid });
        setPendingInvites(pendingInvites.filter(i => i.id !== invite.id));
    };
    // 拒绝邀请
    const handleDecline = async (invite: any) => {
        await supabase.from('Invite').update({ status: 'declined' }).eq('id', invite.id);
        setPendingInvites(pendingInvites.filter(i => i.id !== invite.id));
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

    // 断开配对
    const handleBreakup = async () => {
        if (!partnerId || !user) return;
        // 删除双方的配对关系（无论uid1/uid2顺序）
        await supabase
            .from('Couple')
            .delete()
            .or(`and(uid1.eq.${user.id},uid2.eq.${partnerId}),and(uid1.eq.${partnerId},uid2.eq.${user.id})`);
        window.location.reload(); // 刷新页面，回到未配对状态
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
                {/* 左上角登出按钮 */}
                <div className="absolute top-2 left-2 z-50">
                    <LogoutButton />
                </div>
                {/* 收到的邀请弹窗 */}
                {pendingInvites.length > 0 && (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-white shadow p-4 rounded z-50">
                        <div className="mb-2">あなたへの招待：</div>
                        {pendingInvites.map(invite => (
                            <div key={invite.id} className="flex items-center gap-2 mb-2">
                                <span>{invite.from_user?.name || '未知用户'} ({invite.from_uid}) からの招待</span>
                                <button onClick={() => handleAccept(invite)} className="px-2 py-1 bg-blue-500 text-white rounded">同意</button>
                                <button onClick={() => handleDecline(invite)} className="px-2 py-1 bg-gray-300 text-gray-700 rounded">拒否</button>
                            </div>
                        ))}
                    </div>
                )}
                {/* 发起邀请 */}
                <p className="text-xl mb-6">招待しょう！</p>
                <input
                    type="text"
                    value={inviteId}
                    onChange={(e) => setInviteId(e.target.value)}
                    placeholder="IDを入力"
                    className="border border-gray-300 rounded px-4 py-2 mb-4 w-full max-w-xs"
                />
                <button
                    onClick={handleInvite}
                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-6 rounded"
                >
                    招待
                </button>
                {/* 显示自己发出的邀请状态 */}
                {sentInvites.length > 0 && (
                    <div className="mt-6 w-full max-w-xs text-left">
                        <div className="mb-2 text-sm text-gray-600">あなたが送った招待：</div>
                        {sentInvites.map(invite => (
                            <div key={invite.id} className="flex items-center gap-2 mb-1 text-xs">
                                <span>→ {invite.to_user?.name || '未知用户'} ({invite.to_uid})</span>
                                <span className={
                                    invite.status === 'pending' ? 'text-yellow-500' :
                                    invite.status === 'accepted' ? 'text-green-600' :
                                    'text-gray-400'
                                }>
                                    {invite.status === 'pending' && '待機中'}
                                    {invite.status === 'accepted' && '同意された'}
                                    {invite.status === 'declined' && '拒否された'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
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
                    {/* 添加图片 */}
                    <div className="flex justify-center mb-4">
                        <img 
                            src="/feature/home/images/love_couple_good.png" 
                            alt="カップル" 
                            className="w-32 h-32 object-contain"
                        />
                    </div>
                    <div className="text-center text-white mb-1">相手の幸福度</div>
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
                    <div className="text-center text-sm text-white mt-1">
                        {partnerName || '相手'}
                    </div>
                    {/* 更新列表显示 */}
                    <div className="mt-4 bg-white rounded-lg shadow p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">最近の活動</h3>
                        <ul className="space-y-2">
                            {recentActions.length > 0 ? (
                                recentActions.map((action, index) => {
                                    // 格式化时间显示
                                    const date = new Date(action.timestamp);
                                    const now = new Date();
                                    const diffTime = Math.abs(now.getTime() - date.getTime());
                                    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                                    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
                                    const diffMinutes = Math.floor(diffTime / (1000 * 60));

                                    let timeDisplay = '';
                                    if (diffDays > 0) {
                                        timeDisplay = diffDays === 1 ? '昨日' : `${diffDays}日前`;
                                    } else if (diffHours > 0) {
                                        timeDisplay = `${diffHours}時間前`;
                                    } else if (diffMinutes > 0) {
                                        timeDisplay = `${diffMinutes}分前`;
                                    } else {
                                        timeDisplay = 'たった今';
                                    }

                                    return (
                                        <li key={index} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center">
                                                <span className="text-gray-600">{action.action_name}</span>
                                                <span className={`ml-2 text-xs ${action.happiness_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {action.happiness_change > 0 ? '+' : ''}{action.happiness_change}
                                                </span>
                                            </div>
                                            <span className="text-gray-400 text-xs">{timeDisplay}</span>
                                        </li>
                                    );
                                })
                            ) : (
                                <li className="text-sm text-gray-500 text-center">まだ活動がありません</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {/* 自分の幸福度（右上角，动态颜色+数字居中，宽度60%+动态边框） */}
            <div className="absolute top-4 right-4 w-24">
                <div className="text-sm text-white mb-1 text-right">自分の幸福度</div>
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
                <div className="text-sm text-white mt-1 text-right">
                    {userName || '自分'}
                </div>
            </div>

            <div className="fixed bottom-20 left-4">
                <button 
                    onClick={() => setShowTimeModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center w-14 h-14 transition-transform hover:scale-105"
                >
                    <svg 
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        className="w-8 h-8"
                    >
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </button>
            </div>

            {/* 时间选择弹出框 */}
            {showTimeModal && (
                <div 
                    className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50"
                    onClick={(e) => {
                        // 只有当点击的是遮罩层本身时才关闭
                        if (e.target === e.currentTarget) {
                            setShowTimeModal(false);
                        }
                    }}
                >
                    <div className="bg-white/90 backdrop-blur-md rounded-lg p-6 w-80 shadow-xl border border-white/20">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">時間範囲を選択</h3>
                            <button 
                                onClick={() => setShowTimeModal(false)}
                                className="text-gray-400 hover:text-gray-500 transition-colors"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* 时间范围选择按钮 */}
                        <div className="flex justify-between mb-6">
                            {(['1日', '1週間', '1ヶ月'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setSelectedTimeRange(range)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                                        ${selectedTimeRange === range 
                                            ? 'bg-purple-500 text-white shadow-md hover:bg-purple-600' 
                                            : 'bg-white/50 backdrop-blur-sm text-gray-700 hover:bg-white/80 border border-gray-200'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>

                        {/* 生成按钮 */}
                        <button
                            onClick={() => {
                                console.log('生成时间范围:', selectedTimeRange);
                                setShowTimeModal(false);
                                // TODO: 这里添加生成逻辑
                            }}
                            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
                        >
                            生成！
                        </button>
                    </div>
                </div>
            )}

            {/* 右下角断开配对按钮 */}
            <div className="fixed bottom-20 right-4">
                <button
                    className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg text-sm"
                    onClick={() => setShowBreakupModal(true)}
                >
                    パートナー解除
                </button>
            </div>

            {/* 断开配对确认弹窗 */}
            {showBreakupModal && (
                <div 
                    className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            setShowBreakupModal(false);
                        }
                    }}
                >
                    <div className="bg-white/90 backdrop-blur-md rounded-lg p-6 w-80 shadow-xl border border-white/20">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">確認</h3>
                            <button 
                                onClick={() => setShowBreakupModal(false)}
                                className="text-gray-400 hover:text-gray-500 transition-colors"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <p className="text-gray-600 mb-6">
                            本当にこのパートナーとの関係を解除しますか？
                            <br />
                            この操作は取り消せません。
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBreakupModal(false)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={() => {
                                    setShowBreakupModal(false);
                                    handleBreakup();
                                }}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
                            >
                                解除する
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomeDisplay;
