import EventForm from '../../shared/forms/EventForm.jsx';

export default function AlumniAddEvent() {
  return (
    <EventForm
      config={{
        title: 'Create Alumni Event',
        subtitle: 'Fill in the details to publish a new alumni event.',
        backPath: '/alumni-events',
        successPath: '/alumni-events',
      }}
    />
  );
}
