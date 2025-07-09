import React, { useMemo, useState, forwardRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Platform, Image
} from 'react-native';
import { BottomSheetModal, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Ionicons';

const TEXT_COLOR = '#44403C';

const CommentItem = ({ item }) => (
  <View style={styles.commentItemContainer}>
    {item.avatar
      ? <Image source={{ uri: item.avatar }} style={styles.avatar} />
      : <Icon name="person-circle-outline" size={40} color="#888" />
    }
    <View style={styles.commentTextContainer}>
      <Text style={styles.commentUser}>{item.user}</Text>
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  </View>
);

export const CommentsSheet = forwardRef(({ comments, onSubmit }, ref) => {
  const [newComment, setNewComment] = useState('');
  const snapPoints = useMemo(() => ['50%', '85%'], []);

  const handleSend = () => {
    if (newComment.trim()) {
      onSubmit(newComment.trim());
      setNewComment('');
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={1}
      snapPoints={snapPoints}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Comentarios</Text>

        <BottomSheetFlatList
          data={comments}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <CommentItem item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputContainer}>
          <Icon name="person-circle" size={40} color="#888" />
          <TextInput
            style={styles.textInput}
            placeholder="Añadir comentario..."
            placeholderTextColor="#999"
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
            <Icon name="arrow-up-circle" size={32} color="#FDBA74" />
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  handle:    { backgroundColor: '#CCC', width: 40 },
  background:{ backgroundColor: '#F5EFE6' },
  container: { flex: 1, paddingHorizontal: 16, paddingBottom: 80 },
  title:     { fontSize:18, fontWeight:'bold', textAlign:'center', color:TEXT_COLOR, marginVertical:10 },
  listContent:{ paddingBottom: 20 },
  commentItemContainer:{ flexDirection:'row', paddingVertical:12 },
   avatar: { width:40, height:40, borderRadius:20 },
  commentTextContainer: { flex:1, marginLeft:12 },
  commentUser: { fontWeight:'bold', color:TEXT_COLOR, marginBottom:4 },
  commentText: { color:TEXT_COLOR, lineHeight:18 },
  inputContainer:{
    position:'absolute', bottom:20, left:0,right:0,
    flexDirection:'row', alignItems:'center',
    paddingHorizontal:16, paddingVertical:10,
    backgroundColor:'#F5EFE6',
    borderTopWidth:1, borderTopColor:'#E0E0E0'
  },
  textInput: {
    flex:1, minHeight:40, maxHeight:100,
    backgroundColor:'#FFF', borderRadius:20,
    paddingHorizontal:15,
    paddingVertical: Platform.OS==='ios'?10:5,
    marginHorizontal:10
  },
  sendButton: { padding:4 }
});
