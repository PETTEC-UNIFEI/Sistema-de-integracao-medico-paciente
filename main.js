// Utilizando LocalStorage para armazenar usuários, agendamentos e mensagens
let users = JSON.parse(localStorage.getItem('users')) || [];
let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
let messages = JSON.parse(localStorage.getItem('messages')) || [];

// Função para exibir formulário de registro
function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

// Função para exibir formulário de login
function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

// Função para alternar campo CRM
function toggleCRM() {
    const registerType = document.getElementById('registerType').value;
    const crmField = document.getElementById('crmField');
    if (registerType === 'doctor') {
        crmField.style.display = 'block';
    } else {
        crmField.style.display = 'none';
    }
}

// Função para registrar novos usuários
function register() {
    const type = document.getElementById('registerType').value;
    const email = document.getElementById('registerEmail').value;
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const crm = type === 'doctor' ? document.getElementById('registerCRM').value : '';
    const city = type === 'doctor' ? document.getElementById('registerCity').value : '';
    const state = type === 'doctor' ? document.getElementById('registerState').value : '';

    if (users.find(user => user.email === email)) {
        alert('Email já registrado');
        return;
    }

    users.push({ type, email, username, password, crm, city, state });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registro bem-sucedido');
    showLoginForm();
}

// Função para fazer login
function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        if (user.type === 'doctor') {
            showDoctorSchedule(user);
        } else {
            showPatientBooking();
        }
    } else {
        alert('Email ou senha inválidos');
    }
}

// Função para exibir agenda do médico
function showDoctorSchedule(user) {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('doctorSchedule').style.display = 'block';

    const scheduleDiv = document.getElementById('schedule');
    scheduleDiv.innerHTML = '';

    // Adiciona as datas e horários agendados
    const dates = appointments
        .filter(appt => appt.doctorEmail === user.email)
        .map(appt => appt.date);

    const uniqueDates = [...new Set(dates)];

    uniqueDates.forEach(date => {
        const dateDiv = document.createElement('div');
        dateDiv.innerText = `Data: ${date}`;
        scheduleDiv.appendChild(dateDiv);

        for (let i = 8; i <= 17; i++) {
            const timeSlot = document.createElement('div');
            timeSlot.innerText = `${i}:00 - ${i + 1}:00`;
            timeSlot.classList.add('time-slot');

            const appointment = appointments.find(appt => appt.doctorEmail === user.email && appt.time === i && appt.date === date);
            if (appointment) {
                timeSlot.innerText += ` (Agendado por ${appointment.patientUsername})`;
                timeSlot.classList.add('booked');
            }

            scheduleDiv.appendChild(timeSlot);
        }
    });

    // Exibir mensagens dos pacientes
    showPatientMessages(user);
}

// Função para exibir sistema de agendamento para pacientes
function showPatientBooking() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('doctorSchedule').style.display = 'none';
    document.getElementById('patientBooking').style.display = 'block';

    const selectCity = document.getElementById('selectCity');
    selectCity.innerHTML = '';

    const cities = [...new Set(users.filter(user => user.type === 'doctor').map(doctor => doctor.city))];
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.innerText = city;
        selectCity.appendChild(option);
    });

    showPatientAppointments();
    showChat();
}

// Função para carregar médicos de acordo com a cidade
function loadDoctorsByCity() {
    const city = document.getElementById('selectCity').value;
    const selectDoctor = document.getElementById('selectDoctor');
    selectDoctor.innerHTML = '';

    const doctors = users.filter(user => user.type === 'doctor' && user.city === city);
    doctors.forEach(doctor => {
        const option = document.createElement('option');
        option.value = doctor.email;
        option.innerText = `${doctor.username} (${doctor.city}, ${doctor.state})`;
        selectDoctor.appendChild(option);
    });

    loadAvailableTimes();
}

// Função para carregar horários disponíveis
function loadAvailableTimes() {
    const doctorEmail = document.getElementById('selectDoctor').value;
    const date = document.getElementById('selectDate').value;
    const selectTime = document.getElementById('selectTime');
    selectTime.innerHTML = '';

    for (let i = 8; i <= 17; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.innerText = `${i}:00 - ${i + 1}:00`;

        const appointment = appointments.find(appt => appt.doctorEmail === doctorEmail && appt.time === i && appt.date === date);
        if (!appointment) {
            selectTime.appendChild(option);
        }
    }
}

// Função para agendar uma consulta
function bookAppointment() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const doctorEmail = document.getElementById('selectDoctor').value;
    const date = document.getElementById('selectDate').value;
    const time = parseInt(document.getElementById('selectTime').value);
    const type = document.getElementById('selectType').value;

    if (!doctorEmail || !date || isNaN(time) || !type) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    appointments.push({
        doctorEmail,
        patientEmail: currentUser.email,
        patientUsername: currentUser.username,
        date,
        time,
        type
    });
    localStorage.setItem('appointments', JSON.stringify(appointments));

    alert('Consulta agendada com sucesso');
    loadAvailableTimes();
    showPatientAppointments();
}

// Função para exibir consultas do paciente
function showPatientAppointments() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const patientAppointmentsDiv = document.getElementById('patientAppointments');
    patientAppointmentsDiv.innerHTML = '<h3>Suas Consultas:</h3>';

    const patientAppointments = appointments.filter(appt => appt.patientEmail === currentUser.email);
    patientAppointments.forEach(appt => {
        const appointmentDiv = document.createElement('div');
        appointmentDiv.innerText = `Médico: ${appt.doctorEmail}, Data: ${appt.date}, Horário: ${appt.time}:00 - ${appt.time + 1}:00, Tipo: ${appt.type}`;
        
        const cancelButton = document.createElement('button');
        cancelButton.innerText = 'Cancelar Consulta';
        cancelButton.onclick = () => cancelAppointment(appt);
        
        appointmentDiv.appendChild(cancelButton);
        patientAppointmentsDiv.appendChild(appointmentDiv);
    });
}

// Função para cancelar uma consulta
function cancelAppointment(appointment) {
    appointments = appointments.filter(appt => !(appt.doctorEmail === appointment.doctorEmail && appt.patientEmail === appointment.patientEmail && appt.date === appointment.date && appt.time === appointment.time));
    localStorage.setItem('appointments', JSON.stringify(appointments));

    alert('Consulta cancelada com sucesso');
    loadAvailableTimes();
    showPatientAppointments();
}

// Função para enviar mensagem
function sendMessage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const doctorEmail = document.getElementById('selectDoctor').value;
    const messageContent = document.getElementById('patientMessage').value;

    if (!doctorEmail || !messageContent) {
        alert('Por favor, preencha todos os campos');
        return;
    }

    messages.push({
        doctorEmail,
        patientEmail: currentUser.email,
        patientUsername: currentUser.username,
        content: messageContent,
        date: new Date().toLocaleString(),
        isReply: false
    });
    localStorage.setItem('messages', JSON.stringify(messages));

    alert('Mensagem enviada com sucesso');
    document.getElementById('patientMessage').value = '';
    showChat();
}

// Função para exibir mensagens dos pacientes
function showPatientMessages(doctor) {
    const patientMessagesDiv = document.getElementById('patientMessages');
    patientMessagesDiv.innerHTML = '';

    const doctorMessages = messages.filter(msg => msg.doctorEmail === doctor.email && !msg.isReply);
    doctorMessages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.innerText = `De: ${msg.patientUsername} (${msg.patientEmail})\nMensagem: ${msg.content}\nData: ${msg.date}`;

        const replyInput = document.createElement('textarea');
        replyInput.placeholder = 'Responder...';

        const replyButton = document.createElement('button');
        replyButton.innerText = 'Enviar Resposta';
        replyButton.onclick = () => sendReply(msg, replyInput.value);

        messageDiv.appendChild(replyInput);
        messageDiv.appendChild(replyButton);
        patientMessagesDiv.appendChild(messageDiv);
    });
}

// Função para enviar resposta ao paciente
function sendReply(message, replyContent) {
    if (!replyContent) {
        alert('Por favor, preencha a resposta');
        return;
    }

    messages.push({
        doctorEmail: message.doctorEmail,
        patientEmail: message.patientEmail,
        patientUsername: message.patientUsername,
        content: replyContent,
        date: new Date().toLocaleString(),
        isReply: true
    });
    localStorage.setItem('messages', JSON.stringify(messages));

    alert('Resposta enviada com sucesso');
    showPatientMessages({ email: message.doctorEmail });
}

// Função para exibir o chat
function showChat() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const chatDiv = document.getElementById('chat');
    chatDiv.innerHTML = '<h3>Chat:</h3>';

    const userMessages = messages.filter(msg => msg.patientEmail === currentUser.email || msg.doctorEmail === currentUser.email);
    userMessages.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.innerText = `${msg.isReply ? 'Resposta de' : 'Mensagem de'}: ${msg.patientUsername} (${msg.patientEmail})\n${msg.content}\nData: ${msg.date}`;
        chatDiv.appendChild(messageDiv);
    });
}

// Função para logout
function logout() {
    localStorage.removeItem('currentUser');
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('doctorSchedule').style.display = 'none';
    document.getElementById('patientBooking').style.display = 'none';
}
