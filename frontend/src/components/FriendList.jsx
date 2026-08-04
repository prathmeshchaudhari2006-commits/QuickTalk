import React, { useState } from "react";
import { UserPlus, Clock, Check, X, Search, Users } from "lucide-react";
import axiosInstance from "../api/axiosInstance";

const FriendList = ({
  friends,
  pendingIncoming,
  pendingOutgoing,
  activeFriend,
  onSelectFriend,
  onlineUserIds,
  onRefreshFriends,
  lastMessagesMap
}) => {
  const [tab, setTab] = useState("friends"); // "friends" | "requests" | "add"
  const [searchEmail, setSearchEmail] = useState("");
  const [filterQuery, setFilterQuery] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddFriend = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;

    setStatusMsg("");
    setErrorMsg("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/api/friends/add", { email: searchEmail.trim() });
      setStatusMsg(response.data.message || "Friend request sent!");
      setSearchEmail("");
      onRefreshFriends();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to send friend request.");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId, action) => {
    try {
      await axiosInstance.post("/api/friends/respond", { requestId, action });
      onRefreshFriends();
    } catch (err) {
      console.error("Failed to respond to request:", err);
    }
  };

  const filteredFriends = friends.filter((f) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return f.name.toLowerCase().includes(q) || f.email.toLowerCase().includes(q);
  });

  return (
    <div className="w-full sm:w-[280px] shrink-0 border-r border-[#DEDAD1] bg-[#FFFFFF] flex flex-col h-full font-sans">
      
      {/* Underlined Text Tabs */}
      <div className="flex border-b border-[#DEDAD1]">
        <button
          onClick={() => setTab("friends")}
          className={`flex-1 py-3 text-center text-xs transition-colors cursor-pointer ${
            tab === "friends"
              ? "border-b-2 border-b-[#C1511A] text-[#1C1B19] font-semibold"
              : "text-[#6F6B62] hover:text-[#1C1B19]"
          }`}
        >
          Friends ({friends.length})
        </button>

        <button
          onClick={() => setTab("requests")}
          className={`flex-1 py-3 text-center text-xs transition-colors cursor-pointer relative ${
            tab === "requests"
              ? "border-b-2 border-b-[#C1511A] text-[#1C1B19] font-semibold"
              : "text-[#6F6B62] hover:text-[#1C1B19]"
          }`}
        >
          <span>Pending</span>
          {pendingIncoming.length > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#C1511A] inline-block ml-1" />
          )}
          <span className="ml-1 text-[11px]">({pendingIncoming.length})</span>
        </button>

        <button
          onClick={() => setTab("add")}
          className={`px-3 py-3 text-center text-xs transition-colors cursor-pointer ${
            tab === "add"
              ? "border-b-2 border-b-[#C1511A] text-[#1C1B19] font-semibold"
              : "text-[#6F6B62] hover:text-[#1C1B19]"
          }`}
        >
          + Add
        </button>
      </div>

      {/* Friends Search Filter Bar */}
      {tab === "friends" && friends.length > 0 && (
        <div className="p-2 border-b border-[#DEDAD1]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#6F6B62] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-[#F5F3EE] border border-[#DEDAD1] rounded-[4px] pl-8 pr-2 py-1 text-xs text-[#1C1B19] placeholder-[#A39C8F] focus:outline-none focus:border-[#C1511A]"
            />
          </div>
        </div>
      )}

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto">

        {/* Tab 1: Friends List */}
        {tab === "friends" && (
          <div className="divide-y divide-[#DEDAD1]/60">
            {filteredFriends.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#6F6B62]">
                No friends listed.
                <p className="mt-1 text-[11px]">Click <b>+ Add</b> above to invite by email.</p>
              </div>
            ) : (
              filteredFriends.map((friend) => {
                const isOnline = onlineUserIds.includes(friend._id);
                const isActive = activeFriend?._id === friend._id;
                const lastMsg = lastMessagesMap[friend._id];

                return (
                  <button
                    key={friend._id}
                    onClick={() => onSelectFriend(friend)}
                    className={`w-full text-left p-3 flex items-center gap-3 transition-colors cursor-pointer ${
                      isActive
                        ? "bg-[#F5F3EE] border-l-2 border-l-[#C1511A] text-[#1C1B19]"
                        : "hover:bg-[#F5F3EE]/50 text-[#1C1B19]"
                    }`}
                  >
                    {/* Small Square Avatar with 4px border radius */}
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-[4px] bg-[#F0EDE6] border border-[#DEDAD1] text-[#1C1B19] font-bold text-xs flex items-center justify-center">
                        {friend.name.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* Friend Name & Last Message */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs truncate text-[#1C1B19]">
                          {friend.name}
                        </span>
                        {/* Flat Muted Dot for Online/Offline Indicator */}
                        <div className="flex items-center gap-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isOnline ? "bg-[#4C7A54]" : "bg-[#A39C8F]"
                            }`}
                            title={isOnline ? "Online" : "Offline"}
                          />
                        </div>
                      </div>

                      <div className="mt-0.5 flex items-center justify-between text-[11px] text-[#6F6B62]">
                        <span className="truncate">
                          {lastMsg ? lastMsg.text : friend.email}
                        </span>
                        {lastMsg && (
                          <span className="text-[10px] font-mono shrink-0 ml-1.5 text-[#6F6B62]">
                            {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Pending Requests */}
        {tab === "requests" && (
          <div className="p-3 text-xs space-y-4 font-sans">
            <div>
              <h3 className="font-medium text-[11px] text-[#6F6B62] uppercase tracking-wider mb-2">
                Incoming Requests ({pendingIncoming.length})
              </h3>
              {pendingIncoming.length === 0 ? (
                <div className="text-[11px] text-[#6F6B62]">No incoming requests.</div>
              ) : (
                <div className="space-y-2">
                  {pendingIncoming.map((req) => (
                    <div key={req.requestId} className="p-2.5 border border-[#DEDAD1] rounded-[4px] bg-[#FFFFFF]">
                      <div className="font-semibold text-xs text-[#1C1B19]">{req.from.name}</div>
                      <div className="text-[10px] text-[#6F6B62]">{req.from.email}</div>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleRespond(req.requestId, "accepted")}
                          className="flex-1 bg-[#C1511A] text-white py-1 text-[11px] font-medium rounded-[4px] hover:bg-[#A84313] flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3 h-3" /> Accept
                        </button>
                        <button
                          onClick={() => handleRespond(req.requestId, "rejected")}
                          className="px-2.5 border border-[#DEDAD1] text-[#1C1B19] py-1 text-[11px] rounded-[4px] hover:bg-[#F5F3EE] cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#DEDAD1]">
              <h3 className="font-medium text-[11px] text-[#6F6B62] uppercase tracking-wider mb-2">
                Outgoing Requests ({pendingOutgoing.length})
              </h3>
              {pendingOutgoing.length === 0 ? (
                <div className="text-[11px] text-[#6F6B62]">No outgoing requests.</div>
              ) : (
                <div className="space-y-2">
                  {pendingOutgoing.map((req) => (
                    <div key={req.requestId} className="p-2 border border-[#DEDAD1] rounded-[4px] text-[11px] flex justify-between items-center bg-[#FFFFFF]">
                      <div>
                        <div className="font-semibold text-[#1C1B19]">{req.to.name}</div>
                        <div className="text-[10px] text-[#6F6B62]">{req.to.email}</div>
                      </div>
                      <Clock className="w-3.5 h-3.5 text-[#C1511A]" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Add Friend Form */}
        {tab === "add" && (
          <div className="p-4 text-xs font-sans">
            <h3 className="font-semibold text-xs text-[#1C1B19] mb-1">
              Add Friend by Email
            </h3>
            <p className="text-[11px] text-[#6F6B62] mb-3">
              Enter target user's registered email address to start chatting.
            </p>

            {statusMsg && (
              <div className="mb-3 p-2.5 rounded-[4px] bg-[#F5F3EE] border border-[#DEDAD1] text-[#4C7A54] text-[11px]">
                {statusMsg}
              </div>
            )}
            {errorMsg && (
              <div className="mb-3 p-2.5 rounded-[4px] bg-[#FFF5F2] border border-[#C1511A]/30 text-[#C1511A] text-[11px]">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddFriend} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-[#1C1B19] mb-1">
                  Target Email
                </label>
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="bob@signal.net"
                  required
                  className="w-full bg-[#FFFFFF] border border-[#DEDAD1] rounded-[4px] px-3 py-1.5 text-xs text-[#1C1B19] focus:outline-none focus:border-[#C1511A]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C1511A] hover:bg-[#A84313] text-white py-2 font-medium text-xs rounded-[4px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {loading ? "Sending..." : "Send Request"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default FriendList;
