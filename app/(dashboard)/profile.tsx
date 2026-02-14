import { auth, db } from "@/services/firbase";
import { deletePost, updatePost } from "@/services/postService";
import { Feather, Ionicons } from "@expo/vector-icons";
import { updateProfile } from "@firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  StatusBar
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt?: any;
  imageBase64?: string | null;
  category?: string;
  author?: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const [modalVisible, setModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [postCount, setPostCount] = useState(0);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [userName, setUserName] = useState<string>("User");
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState(systemTheme || "light");
  const isDark = theme === "dark";

  // Edit states
  const [newName, setNewName] = useState("");
  const [newProfileImage, setNewProfileImage] = useState<string | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editCategory, setEditCategory] = useState("");

  useEffect(() => {
    fetchProfileData();
  }, [user]);

  const fetchProfileData = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfileImage(data.profileImageBase64 || user.photoURL);
        setUserName(data.name || user.displayName || "User");
        setNewName(data.name || user.displayName || "User");
      }

      const q = query(collection(db, "posts"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const postsArray: Post[] = [];
      querySnapshot.forEach((doc) => {
        postsArray.push({ id: doc.id, ...doc.data() } as Post);
      });
      setMyPosts(postsArray);
      setPostCount(postsArray.length);
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.uid);
      const updateData: any = { name: newName, updatedAt: new Date() };
      if (newProfileImage) updateData.profileImageBase64 = `data:image/jpeg;base64,${newProfileImage}`;

      await updateDoc(userDocRef, updateData);
      await updateProfile(user, { displayName: newName });
      
      setUserName(newName);
      if (newProfileImage) setProfileImage(`data:image/jpeg;base64,${newProfileImage}`);
      setModalVisible(false);
      Toast.show({ type: "success", text1: "Profile Updated!" });
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0].base64) {
      setNewProfileImage(result.assets[0].base64);
    }
  };

  const openEditPostModal = (post: Post) => {
    setSelectedPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditCategory(post.category || "");
    setEditModalVisible(true);
  };

  const handleUpdatePost = async () => {
    if (!selectedPost) return;
    await updatePost(selectedPost.id, editTitle, editCategory, editContent);
    setMyPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, title: editTitle, content: editContent, category: editCategory } : p));
    setEditModalVisible(false);
    Toast.show({ type: "success", text1: "Post Updated!" });
  };

  const handleDeletePost = (postId: string) => {
    Alert.alert("Delete Article", "Are you sure you want to delete this story?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
          await deletePost(postId);
          setMyPosts(prev => prev.filter(p => p.id !== postId));
          setPostCount(c => c - 1);
        }
      },
    ]);
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? "bg-[#0f172a]" : "bg-[#f8fafc]"}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header - Matching Home Page */}
      <View className={`px-6 pt-4 pb-4 ${isDark ? "bg-[#0f172a]" : "bg-white"} border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className="bg-red-600 px-2 py-1 rounded">
              <Text className="text-white font-bold text-lg tracking-tighter">NEWS</Text>
            </View>
            <Text className={`text-lg font-light ml-1 ${isDark ? "text-white" : "text-slate-900"}`}>HUB</Text>
          </View>
          <TouchableOpacity onPress={() => setTheme(isDark ? "light" : "dark")}>
            <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={22} color={isDark ? "#f8fafc" : "#0f172a"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Profile Card */}
        <View className="px-6 py-8 items-center">
          <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden border-4 border-red-600 shadow-lg"
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} className="w-full h-full" />
            ) : (
              <View className="bg-slate-400 w-full h-full items-center justify-center">
                <Text className="text-white text-3xl font-bold">{userName.charAt(0)}</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text className={`text-2xl font-bold mt-4 ${isDark ? "text-white" : "text-slate-900"}`}>{userName}</Text>
          <Text className="text-red-600 font-bold text-xs uppercase tracking-widest mt-1">Contributor</Text>
          
          <View className="flex-row mt-6 space-x-8">
            <View className="items-center m-4">
              <Text className={`text-xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{postCount}</Text>
              <Text className="text-slate-500 text-xs font-bold uppercase">Articles</Text>
            </View>
            <View className={`w-[1px] h-8 ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
            <TouchableOpacity onPress={() => setModalVisible(true)} className="items-center justify-center">
                <Feather name="edit" size={20} color="#dc2626" />
                <Text className="text-red-600 text-xs font-bold uppercase mt-1">Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Articles List */}
        <View className="px-6 pb-24">
          <Text className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>My Stories</Text>
          
          {myPosts.map((post) => (
            <View 
              key={post.id}
              className={`mb-6 rounded-2xl overflow-hidden ${isDark ? "bg-slate-800" : "bg-white"} border ${isDark ? "border-slate-700" : "border-slate-100"} shadow-sm`}
            >
              <Image
                source={{ uri: post.imageBase64?.startsWith("data:image") ? post.imageBase64 : `data:image/jpeg;base64,${post.imageBase64}` }}
                className="w-full h-40"
                resizeMode="cover"
              />
              <View className="p-4">
                <Text className="text-red-600 text-[10px] font-black uppercase mb-1 tracking-tighter">{post.category || "General"}</Text>
                <Text className={`text-lg font-bold mb-3 ${isDark ? "text-white" : "text-slate-900"}`} numberOfLines={2}>
                  {post.title}
                </Text>
                
                <View className="flex-row justify-between items-center pt-3 border-t border-slate-50 dark:border-slate-700">
                  <View className="flex-row space-x-4">
                    <TouchableOpacity onPress={() => openEditPostModal(post)} className="flex-row items-center">
                      <Feather name="edit-3" size={16} color="#64748b" />
                      <Text className="text-slate-500 text-xs font-bold ml-1">EDIT</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeletePost(post.id)} className="flex-row items-center">
                      <Feather name="trash-2" size={16} color="#ef4444" />
                      <Text className="text-red-500 text-xs font-bold ml-1">DELETE</Text>
                    </TouchableOpacity>
                  </View>
                  <Text className="text-slate-400 text-[10px] font-bold">
                    {post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : ""}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {myPosts.length === 0 && (
            <View className="items-center py-10">
              <Feather name="plus-circle" size={40} color="#94a3b8" />
              <Text className="text-slate-400 mt-2 font-medium">You haven't published any stories yet.</Text>
            </View>
          )}

          <TouchableOpacity 
            onPress={() => router.push("/(auth)/login")}
            className="mt-4 flex-row items-center justify-center py-4 rounded-xl border border-red-200 dark:border-red-900/30"
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text className="text-red-500 font-bold ml-2">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modern Bottom Navigation - Exactly matching Home */}
      <View className={`px-4 pb-6 pt-2 ${isDark ? "bg-[#0f172a]" : "bg-white"} border-t ${isDark ? "border-slate-800" : "border-slate-100"}`}>
        <View className="flex-row items-center justify-around h-16">
          <TouchableOpacity className="items-center" onPress={() => router.push("/home")}>
            <Ionicons name="home-outline" size={24} color="#64748b" />
            <Text className="text-[10px] font-bold text-slate-500 mt-1">Feed</Text>
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
            <Ionicons name="person" size={24} color="#dc2626" />
            <Text className="text-[10px] font-bold text-red-600 mt-1">Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/60">
          <View className={`rounded-t-[40px] p-8 ${isDark ? "bg-[#1e293b]" : "bg-white"}`}>
            <View className="w-12 h-1 bg-slate-300 rounded-full self-center mb-6" />
            <Text className={`text-xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>Edit Profile</Text>

            <TouchableOpacity onPress={pickImage} className="items-center mb-6">
                <View className="w-20 h-20 rounded-full items-center justify-center overflow-hidden border-2 border-red-600">
                   {profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      className="w-full h-full rounded-full"
                    />
                  ) : (
                    <Text className="text-white font-bold text-5xl">
                      {user?.displayName?.charAt(0)?.toUpperCase() || "U"}
                    </Text>
                  )}
                </View>
                <Text className="text-red-600 font-bold text-xs mt-2">Change Photo</Text>
            </TouchableOpacity>

            <TextInput
              placeholder="Your Name"
              placeholderTextColor="#94a3b8"
              value={newName}
              onChangeText={setNewName}
              className={`rounded-xl px-4 py-3 mb-6 font-bold ${isDark ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"}`}
            />

            <View className="flex-row space-x-4 mb-4">
                <TouchableOpacity onPress={() => setModalVisible(false)} className="flex-1 py-4 items-center">
                    <Text className="text-slate-500 font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveProfile} className="flex-1 bg-red-600 py-4 rounded-xl items-center">
                    <Text className="text-white font-bold">Update Profile</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Post Edit Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View className="flex-1 justify-center bg-black/80 px-6">
          <View className={`rounded-3xl p-6 ${isDark ? "bg-slate-900" : "bg-white"}`}>
            <Text className={`text-lg font-bold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>Edit Article</Text>
            <TextInput
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Title"
              placeholderTextColor="#94a3b8"
              className={`rounded-xl px-4 py-3 mb-3 font-bold ${isDark ? "bg-slate-800 text-white" : "bg-slate-100"}`}
            />
            <TextInput
              value={editCategory}
              onChangeText={setEditCategory}
              placeholder="Category"
              placeholderTextColor="#94a3b8"
              className={`rounded-xl px-4 py-3 mb-3 font-bold ${isDark ? "bg-slate-800 text-white" : "bg-slate-100"}`}
            />
            <TextInput
              value={editContent}
              onChangeText={setEditContent}
              multiline
              className={`rounded-xl px-4 py-3 h-32 mb-6 ${isDark ? "bg-slate-800 text-white" : "bg-slate-100"}`}
            />
            <View className="flex-row justify-end space-x-4">
              <TouchableOpacity onPress={() => setEditModalVisible(false)}><Text className="text-slate-500 font-bold py-2">Discard</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleUpdatePost} className="bg-red-600 px-6 py-2 rounded-lg"><Text className="text-white font-bold">Save</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </SafeAreaView>
  );
}