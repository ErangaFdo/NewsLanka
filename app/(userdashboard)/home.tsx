import { auth, db } from "@/service/firebase";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();

  const [userName, setUserName] = useState("User");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isExpanded, setIsExpanded] = useState<{ [key: string]: boolean }>({});
  const [likes, setLikes] = useState<{[key: string]: { count: number; liked: boolean };}>({});
  const user = auth.currentUser;
  const systemTheme = useColorScheme();
  const [bookmarks, setBookmarks] = useState<{[key: string]: { saved: boolean , count: number };}>({});
  const [searchText, setSearchText] = useState("");
  const [authorProfiles, setAuthorProfiles] = useState<{ [key: string]: { image: string | null };}>({});

  const [theme, setTheme] = useState(systemTheme || "light");
  const isDark = theme === "dark";

  useEffect(() => {
    const fetchPostsAndProfile = async () => {
      try {
        const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const postsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postsData);

        if (!user) return;
        setUserName(user.displayName || "User");

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          if (data.profileImageBase64) {
            setProfileImage(
              data.profileImageBase64.startsWith("data:image")
                ? data.profileImageBase64
                : `data:image/jpeg;base64,${data.profileImageBase64}`
            );
          } else if (user.photoURL) {
            setProfileImage(user.photoURL);
          }
        }
        await fetchLikesForPosts(postsData);
        await fetchBookmarksForPosts(postsData);
      } catch (error) {
        console.log("Error loading home data:", error);
      }
    };
    fetchPostsAndProfile();
  }, []);

  const fetchLikesForPosts = async (postsData: any[]) => {
    try {
      if (!user) return;
      const likesData: { [key: string]: { count: number; liked: boolean } } ={};
      for (const post of postsData) {
        const likesRef = collection(db, "posts", post.id, "likes");
        const likesSnapshot = await getDocs(likesRef);
        const userLikeRef = doc(db, "posts", post.id, "likes", user.uid);
        const userLikeSnap = await getDoc(userLikeRef);
        likesData[post.id] = { count: likesSnapshot.size, liked: userLikeSnap.exists() };
      }
      setLikes(likesData);
    } catch (error) { console.log(error); }
  };

  const fetchBookmarksForPosts = async (postsData: any[]) => {
    try {
      if (!user) return;
      const bookmarkData: { [key: string]: { saved: boolean; count: number } } = {};
      for (const post of postsData) {
        const bookmarksRef = collection(db, "posts", post.id, "bookmarks");
        const bookmarksSnap = await getDocs(bookmarksRef);
        const userBookmarkRef = doc(db, "posts", post.id, "bookmarks", user.uid);
        const userBookmarkSnap = await getDoc(userBookmarkRef);
        bookmarkData[post.id] = { saved: userBookmarkSnap.exists(), count: bookmarksSnap.size };
      }
      setBookmarks(bookmarkData);
    } catch (error) { console.log(error); }
  };

  const handleLike = async (postId: string) => {
    try {
      if (!user) return;
      const isCurrentlyLiked = likes[postId]?.liked;
      const userLikeRef = doc(db, "posts", postId, "likes", user.uid);
      if (isCurrentlyLiked) await deleteDoc(userLikeRef);
      else await setDoc(userLikeRef, { userId: user.uid, createdAt: new Date() });

      setLikes((prev) => ({
        ...prev,
        [postId]: {
          count: isCurrentlyLiked ? prev[postId].count - 1 : prev[postId].count + 1,
          liked: !isCurrentlyLiked,
        },
      }));
    } catch (error) { console.log(error); }
  };

  const handleBookmark = async (postId: string) => {
    try {
      if (!user) return;
      const bookmarkRef = doc(db, "posts", postId, "bookmarks", user.uid);
      const isSaved = bookmarks[postId]?.saved;
      if (isSaved) await deleteDoc(bookmarkRef);
      else await setDoc(bookmarkRef, { userId: user.uid, savedAt: Timestamp.now() });

      setBookmarks((prev) => ({
        ...prev,
        [postId]: {
          saved: !isSaved,
          count: isSaved ? prev[postId].count - 1 : prev[postId].count + 1,
        },
      }));
    } catch (error) { console.log(error); }
  };

  const filteredPosts = posts.filter((post) => {
    const text = searchText.toLowerCase();
    return (
      post.title?.toLowerCase().includes(text) ||
      post.content?.toLowerCase().includes(text) ||
      post.category?.toLowerCase().includes(text)
    );
  });

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-[#0f172a]" : "bg-[#f8fafc]"}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View className={`px-6 pt-4 pb-4 ${isDark ? "bg-[#0f172a]" : "bg-white"} border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="bg-red-600 px-2 py-1 rounded">
              <Text className="text-white font-bold text-lg tracking-tighter">NEWS</Text>
            </View>
            <Text className={`text-lg font-light ml-1 ${isDark ? "text-white" : "text-slate-900"}`}>HUB</Text>
          </View>

          <View className="flex-row items-center space-x-6 ">
            <TouchableOpacity onPress={() => setTheme(isDark ? "light" : "dark")}>
              <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={27} color={isDark ? "#f8fafc" : "#0f172a"} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push("/profile")}
              className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-red-600 ml-6"
            >
              {profileImage ? (
                <Image source={{ uri: profileImage }} className="w-full h-full" />
              ) : (
                <View className="bg-slate-400 w-full h-full items-center justify-center">
                  <Text className="text-white font-bold">{userName.charAt(0)}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-6 py-4">
        <View className={`flex-row items-center ${isDark ? "bg-slate-800" : "bg-white"} px-4 py-3 rounded-xl border ${isDark ? "border-slate-700" : "border-slate-200"}`}>
          <Feather name="search" size={18} color="#94a3b8" />
          <TextInput
            placeholder="Search news, topics, authors..."
            value={searchText}
            onChangeText={setSearchText}
            className={`flex-1 ml-3 ${isDark ? "text-white" : "text-slate-900"}`}
            placeholderTextColor="#94a3b8"
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        <View className="px-6 pb-20">
          <Text className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
            {searchText ? "Search Results" : "Latest Updates"}
          </Text>

          {filteredPosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              activeOpacity={0.95}
              className={`mb-6 rounded-2xl overflow-hidden ${isDark ? "bg-slate-800" : "bg-white"} shadow-sm border ${isDark ? "border-slate-700" : "border-slate-100"}`}
            >
              {/* Author Info */}
              <View className="flex-row items-center p-4">
                <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center overflow-hidden">
                  {post.authorImage ? (
                    <Image source={{ uri: post.authorImage.startsWith("data:image") ? post.authorImage : `data:image/jpeg;base64,${post.authorImage}` }} className="w-full h-full" />
                  ) : (
                    <Text className="text-red-600 font-bold text-xs">{post.author?.charAt(0)}</Text>
                  )}
                </View>
                <View className="ml-3">
                  <Text className={`font-bold text-sm ${isDark ? "text-slate-200" : "text-slate-900"}`}>{post.author}</Text>
                  <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{post.category || "General"}</Text>
                </View>
              </View>

              {/* News Image */}
              <Image
                source={{ uri: post.imageBase64?.startsWith("data:image") ? post.imageBase64 : `data:image/jpeg;base64,${post.imageBase64}` }}
                className="w-full h-56"
                resizeMode="cover"
              />

              <View className="p-4">
                <Text className={`text-xl font-bold mb-2 leading-7 ${isDark ? "text-white" : "text-slate-900"}`}>
                  {post.title}
                </Text>
                
                <Text
                  className={`text-sm leading-6 ${isDark ? "text-slate-400" : "text-slate-600"}`}
                  numberOfLines={isExpanded[post.id] ? undefined : 3}
                >
                  {post.content}
                </Text>

                {post.content?.length > 100 && (
                  <TouchableOpacity 
                    onPress={() => setIsExpanded(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className="mt-2"
                  >
                    <Text className="text-red-600 font-bold text-xs">{isExpanded[post.id] ? "READ LESS" : "READ FULL STORY"}</Text>
                  </TouchableOpacity>
                )}

                {/* Post Actions */}
                <View className="flex-row justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <View className="flex-row space-x-6">
                    <TouchableOpacity onPress={() => handleLike(post.id)} className="flex-row items-center">
                      <Ionicons 
                        name={likes[post.id]?.liked ? "heart" : "heart-outline"} 
                        size={22} 
                        color={likes[post.id]?.liked ? "#dc2626" : "#64748b"} 
                      />
                      <Text className={`ml-1 font-bold ${likes[post.id]?.liked ? "text-red-600" : "text-slate-500"}`}>
                        {likes[post.id]?.count || 0}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleBookmark(post.id)} className="flex-row items-center ml-6">
                      <Ionicons 
                        name={bookmarks[post.id]?.saved ? "bookmark" : "bookmark-outline"} 
                        size={22} 
                        color={bookmarks[post.id]?.saved ? "#dc2626" : "#64748b"} 
                      />
                      <Text className={`ml-1 font-bold ${bookmarks[post.id]?.saved ? "text-red-600" : "text-slate-500"}`}>
                        {bookmarks[post.id]?.count || 0}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* <TouchableOpacity>
                    <Feather name="share-2" size={20} color="#64748b" />
                  </TouchableOpacity> */}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredPosts.length === 0 && (
          <View className="items-center justify-center py-20">
            <Feather name="info" size={40} color="#94a3b8" />
            <Text className="text-slate-400 mt-4 font-medium">No articles found matching your search</Text>
          </View>
        )}
      </ScrollView>

      {/* Modern Bottom Navigation */}
      <View className={`px-4 pb-6 pt-2 ${isDark ? "bg-[#0f172a]" : "bg-white"} border-t ${isDark ? "border-slate-800" : "border-slate-100"}`}>
        <View className="flex-row items-center justify-around h-16">
          <TouchableOpacity className="items-center" onPress={() => router.push("/")}>
            <Ionicons name="home" size={24} color="#dc2626" />
            <Text className="text-[10px] font-bold text-red-600 mt-1">Feed</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center" onPress={() => router.push("/topics")}>
            <Ionicons name="compass-outline" size={24} color="#64748b" />
            <Text className="text-[10px] font-bold text-slate-500 mt-1">Explore</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/create")}
            className="w-14 h-14 bg-red-600 rounded-full items-center justify-center -mt-10 shadow-lg border-4 border-white dark:border-[#0f172a]"
          >
            <Ionicons name="add" size={32} color="white" />
          </TouchableOpacity>

          <TouchableOpacity className="items-center" onPress={() => router.push("/bookmarks")}>
            <Ionicons name="bookmark-outline" size={24} color="#64748b" />
            <Text className="text-[10px] font-bold text-slate-500 mt-1">Saved</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center" onPress={() => router.push("/profile")}>
            <Ionicons name="person-outline" size={24} color="#64748b" />
            <Text className="text-[10px] font-bold text-slate-500 mt-1">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}