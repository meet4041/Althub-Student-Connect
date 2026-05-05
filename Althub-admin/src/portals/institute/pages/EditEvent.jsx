import EventForm from '../../shared/forms/EventForm.jsx';

export default function EditEvent() {
  return (
    <EventForm
      config={{
        mode: 'edit',
        editTitle: 'Edit Event',
        subtitle: 'Update the event details and add new media.',
        backPath: '/events',
        successPath: '/events',
      }}
    />
  );
}
