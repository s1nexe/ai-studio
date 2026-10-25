'use strict';

/* ==========================================================================
   1. Мобильное меню
   ========================================================================== */
const header = document.querySelector('.header');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav');

function setMenu(isOpen) {
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
  nav.classList.toggle('is-open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  setMenu(!isOpen);
});

// Закрываем меню после перехода по ссылке
nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) setMenu(false);
});

// Закрываем меню клавишей Escape и возвращаем фокус на кнопку
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) {
    setMenu(false);
    menuToggle.focus();
  }
});

// Если экран стал широким (например, повернули планшет) — меню больше не нужно
window.matchMedia('(min-width: 861px)').addEventListener('change', (event) => {
  if (event.matches) setMenu(false);
});

/* ==========================================================================
   2. Шапка получает фон, когда страницу прокрутили
   ========================================================================== */
function updateHeader() {
  header.classList.toggle('is-scrolled', window.scrollY > 20);
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

/* ==========================================================================
   3. Плавное появление элементов при прокрутке
   ========================================================================== */
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target); // анимируем только один раз
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

/* ==========================================================================
   4. Свечение карточек вслед за курсором (только для мыши)
   ========================================================================== */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    });
  });
}

/* ==========================================================================
   5. Фильтр демо-работ в портфолио
   ========================================================================== */
const filterButtons = document.querySelectorAll('.filter');
const works = document.querySelectorAll('.work');
const filterStatus = document.getElementById('filter-status');

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((btn) => {
      const isActive = btn === button;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    let visibleCount = 0;
    works.forEach((work) => {
      const matches = filter === 'all' || work.dataset.category === filter;
      work.hidden = !matches;
      if (matches) {
        work.classList.add('is-visible'); // показываем сразу, без ожидания прокрутки
        visibleCount += 1;
      }
    });

    // Сообщаем экранному диктору результат фильтрации
    filterStatus.textContent = `Показано работ: ${visibleCount} из ${works.length}`;
  });
});

/* ==========================================================================
   6. Демонстрационная форма — ничего не отправляет на сервер
   ========================================================================== */
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

const validators = {
  name: (value) => (value.trim().length >= 2 ? '' : 'Укажите имя — хотя бы 2 символа.'),
  email: (value) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Введите корректный email, например name@mail.ru.'),
  message: (value) => (value.trim().length >= 10 ? '' : 'Опишите проект чуть подробнее — от 10 символов.'),
};

function validateField(input) {
  const error = validators[input.name](input.value);
  const errorElement = document.getElementById(`${input.name}-error`);

  errorElement.textContent = error;
  input.setAttribute('aria-invalid', String(Boolean(error)));
  return !error;
}

// Убираем ошибку, как только пользователь начал её исправлять
Object.keys(validators).forEach((name) => {
  const input = form.elements[name];
  input.addEventListener('input', () => {
    if (input.getAttribute('aria-invalid') === 'true') validateField(input);
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault(); // не даём браузеру отправить форму

  const inputs = Object.keys(validators).map((name) => form.elements[name]);
  const results = inputs.map(validateField);
  const firstInvalid = inputs[results.indexOf(false)];

  if (firstInvalid) {
    formStatus.textContent = '';
    // Прокручиваем к полю вместе с подписью, чтобы её не закрыла шапка
    firstInvalid.closest('.field').scrollIntoView({ block: 'nearest' });
    firstInvalid.focus({ preventScroll: true });
    return;
  }

  const name = form.elements.name.value.trim();
  formStatus.textContent = `Спасибо, ${name}! Это демо-режим: заявка никуда не отправлена.`;
  form.reset();
  inputs.forEach((input) => input.removeAttribute('aria-invalid'));
});

/* ==========================================================================
   7. Текущий год в подвале
   ========================================================================== */
document.getElementById('year').textContent = new Date().getFullYear();
