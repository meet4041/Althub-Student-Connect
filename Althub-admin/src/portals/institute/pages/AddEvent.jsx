import EventForm from '../../shared/forms/EventForm.jsx';

export default function AddEvent() {
  return (
    <EventForm
      config={{
        title: 'Create New Event',
        subtitle: 'Fill in the details to publish a new institutional event.',
        backPath: '/events',
        successPath: '/events',
      }}
    />
  );
}
