import PostForm from '../../shared/forms/PostForm.jsx';

export default function EditPost() {
  return (
    <PostForm
      config={{
        mode: 'edit',
        editTitle: 'Edit Community Post',
        subtitle: 'Update post content or add new media.',
        backPath: '/posts',
        successPath: '/posts',
      }}
    />
  );
}
