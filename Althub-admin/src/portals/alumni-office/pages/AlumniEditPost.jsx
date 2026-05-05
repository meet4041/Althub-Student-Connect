import PostForm from '../../shared/forms/PostForm.jsx';

export default function AlumniEditPost() {
  return (
    <PostForm
      config={{
        mode: 'edit',
        editTitle: 'Edit Alumni Post',
        subtitle: 'Update alumni post content or add new media.',
        backPath: '/alumni-posts',
        successPath: '/alumni-posts',
      }}
    />
  );
}
