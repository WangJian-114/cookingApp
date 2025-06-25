// src/presentation/components/shared/details/CommentsSheet.tsx

import React, { useMemo, useState, forwardRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import Icon from 'react-native-vector-icons/Ionicons';

const TEXT_COLOR = '#44403C';

const CommentItem = ({ item }) => (
  <View style={styles.commentItemContainer}>
    <Icon name="person-circle-outline" size={40} color="#888" />
    <View style={styles.commentTextContainer}>
      <Text style={styles.commentUser}>{item.user}</Text>
      <Text style={styles.commentText}>{item.text}</Text>
      <TouchableOpacity>
        <Text style={styles.replyText}>Responder</Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity>
      <Icon name="heart-outline" size={20} color="#888" />
    </TouchableOpacity>
  </View>
);


export const CommentsSheet = forwardRef(({ comments, onSubmit }, ref) => {
  const [newComment, setNewComment] = useState('');
  const snapPoints = useMemo(() => ['50%', '85%'], []);

  const handleSendComment = () => {
    if (newComment.trim().length > 0) {
      onSubmit(newComment);
      setNewComment('');
    }
  };

  return (
    <BottomSheetModal
      ref={ref}
      index={1}
      snapPoints={snapPoints}
      handleIndicatorStyle={{ backgroundColor: '#CCC' }}
      backgroundStyle={{ backgroundColor: '#F5EFE6' }}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Comentarios</Text>
        <BottomSheetFlatList
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CommentItem item={item} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        <View style={styles.inputContainer}>
          <Icon name="person-circle" size={40} color="#888" />
          <TextInput
            style={styles.textInput}
            placeholder="Añadir comentario..."
            placeholderTextColor="#999"
            value={newComment}
            onChangeText={setNewComment}
          />
          <TouchableOpacity onPress={handleSendComment} style={styles.sendButton}>
            <Icon name="arrow-up-circle" size={32} color="#FDBA74" />
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
});


const styles = StyleSheet.create({
  contentContainer: { flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: TEXT_COLOR, marginBottom: 15 },
  commentItemContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, alignItems: 'flex-start' },
  commentTextContainer: { flex: 1, marginLeft: 12 },
  commentUser: { fontWeight: 'bold', color: TEXT_COLOR, marginBottom: 2 },
  commentText: { color: TEXT_COLOR, lineHeight: 18 },
  replyText: { color: '#888', fontSize: 12, marginTop: 4 },
  inputContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#F5EFE6', borderTopWidth: 1, borderTopColor: '#E0E0E0' },
  textInput: { flex: 1, height: 40, backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 15, marginHorizontal: 10 },
  sendButton: { padding: 4 }
});